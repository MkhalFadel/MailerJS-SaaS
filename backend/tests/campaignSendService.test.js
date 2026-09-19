const assert = require("node:assert/strict");
const test = require("node:test");

function loadCampaignSendService(
   prisma,
   enqueueCampaignSend,
   removeQueuedCampaignSend = async () => "not_found"
)
{
   const servicePath = require.resolve("../services/campaignSendService");
   const prismaPath = require.resolve("../lib/prisma");
   const queuePath = require.resolve("../queues/campaignQueue");
   const cachedModules = new Map([
      [servicePath, require.cache[servicePath]],
      [prismaPath, require.cache[prismaPath]],
      [queuePath, require.cache[queuePath]]
   ]);

   require.cache[prismaPath] = {
      exports: prisma
   };
   require.cache[queuePath] = {
      exports: {
         enqueueCampaignSend,
         removeQueuedCampaignSend
      }
   };
   delete require.cache[servicePath];

   const service = require(servicePath);

   return {
      service,
      restore()
      {
         for(const [modulePath, cachedModule] of cachedModules)
         {
            if(cachedModule)
               require.cache[modulePath] = cachedModule;
            else
               delete require.cache[modulePath];
         }
      }
   };
}

function matchesStatus(status, condition)
{
   if(!condition)
      return true;

   if(condition.in)
      return condition.in.includes(status);

   return status === condition;
}

function createCancellationPrisma(
   status = "QUEUED",
   ownerId = "user-id"
)
{
   const campaignSend = {
      id: "send-id",
      campaign_id: "campaign-id",
      active_key: "campaign-id",
      status,
      total_recipients: 3,
      accepted_count: 1,
      failed_count: 1,
      created_at: new Date(),
      started_at: null,
      completed_at: null
   };
   const deliveries = [
      { campaign_send_id: "send-id", status: "accepted" },
      { campaign_send_id: "send-id", status: "failed" },
      { campaign_send_id: "send-id", status: "pending" }
   ];

   return {
      campaign_sends: {
         findFirst: async ({ where }) => {
            if(where.campaign?.user_id !== ownerId)
               return null;

            return campaignSend;
         },
         findUnique: async () => campaignSend,
         updateMany: async ({ where, data }) => {
            if(
               where.id !== campaignSend.id ||
               !matchesStatus(campaignSend.status, where.status)
            )
               return { count: 0 };

            Object.assign(campaignSend, data);
            return { count: 1 };
         }
      },
      campaign_deliveries: {
         count: async ({ where }) => deliveries.filter(
            delivery =>
               delivery.campaign_send_id === where.campaign_send_id &&
               delivery.status === where.status
         ).length
      },
      getCampaignSend: () => campaignSend
   };
}

function createCampaign(recipients = [])
{
   return {
      id: "campaign-id",
      template_id: "template-id",
      template: {
         content: "Hello {{first_name}}"
      },
      smtp_account: {
         host: "smtp.example.com",
         username: "mailer@example.com",
         password_encrypted: "encrypted-password",
         sender_email: "mailer@example.com"
      },
      recipients
   };
}

function createPrisma(campaign, activeSend = null)
{
   let createdData;

   const transaction = {
      campaigns: {
         findFirst: async () => campaign
      },
      campaign_sends: {
         findFirst: async () => activeSend,
         create: async ({ data }) => {
            createdData = data;

            return {
               id: "send-id",
               status: "QUEUED",
               accepted_count: 0,
               failed_count: 0,
               created_at: new Date(),
               ...data
            };
         }
      }
   };

   return {
      $transaction: async (callback) => callback(transaction),
      campaign_sends: {
         update: async () => null
      },
      getCreatedData: () => createdData
   };
}

test("createCampaignSend rejects missing campaigns and recipients", async (context) => {
   const missingCampaign = loadCampaignSendService(
      createPrisma(null),
      async () => null
   );
   context.after(() => missingCampaign.restore());

   await assert.rejects(
      () => missingCampaign.service.createCampaignSend("campaign-id", "user-id"),
      (error) => error.status === 404
   );

   const noRecipientsPrisma = createPrisma(createCampaign());
   const noRecipients = loadCampaignSendService(
      noRecipientsPrisma,
      async () => null
   );
   context.after(() => noRecipients.restore());

   await assert.rejects(
      () => noRecipients.service.createCampaignSend("campaign-id", "user-id"),
      (error) =>
         error.status === 400 &&
         error.message === "This campaign has no recipients. Edit the campaign and add at least one contact before sending."
   );
   assert.equal(noRecipientsPrisma.getCreatedData(), undefined);
});

test("createCampaignSend rejects a campaign whose template was deleted before queueing", async (context) => {
   const campaign = createCampaign([
      {
         id: "campaign-recipient-id",
         contact: {
            email: "ada@example.com",
            first_name: "Ada",
            last_name: "Lovelace"
         }
      }
   ]);
   campaign.template = null;
   campaign.template_id = null;
   const prisma = createPrisma(campaign);
   let queued = false;
   const serviceModule = loadCampaignSendService(
      prisma,
      async () => {
         queued = true;
      }
   );
   context.after(() => serviceModule.restore());

   await assert.rejects(
      () => serviceModule.service.createCampaignSend("campaign-id", "user-id"),
      (error) =>
         error.status === 400 &&
         error.message === "This campaign cannot be sent because its template was deleted. Edit the campaign and select another template."
   );

   assert.equal(prisma.getCreatedData(), undefined);
   assert.equal(queued, false);
});

test("createCampaignSend snapshots recipients and queues only a send id", async (context) => {
   const recipients = [
      {
         id: "campaign-recipient-id",
         contact: {
            email: "ada@example.com",
            first_name: "Ada",
            last_name: "Lovelace"
         }
      }
   ];
   let queuedId;
   const prisma = createPrisma(createCampaign(recipients));
   const serviceModule = loadCampaignSendService(
      prisma,
      async (campaignSendId) => {
         queuedId = campaignSendId;
      }
   );
   context.after(() => serviceModule.restore());

   const campaignSend = await serviceModule.service.createCampaignSend(
      "campaign-id",
      "user-id"
   );

   assert.equal(campaignSend.status, "QUEUED");
   assert.equal(campaignSend.total_recipients, 1);
   assert.equal(queuedId, campaignSend.id);
   assert.deepEqual(prisma.getCreatedData().deliveries.create[0], {
      campaign_recipient_id: "campaign-recipient-id",
      recipient_email: "ada@example.com",
      recipient_first_name: "Ada",
      recipient_last_name: "Lovelace",
      status: "pending"
   });
});

test("createCampaignSend prevents active duplicates and records queue failures", async (context) => {
   const activeSend = loadCampaignSendService(
      createPrisma(createCampaign([{}]), {
         id: "active-send-id"
      }),
      async () => null
   );
   context.after(() => activeSend.restore());

   await assert.rejects(
      () => activeSend.service.createCampaignSend("campaign-id", "user-id"),
      (error) => error.status === 409
   );

   let failedRunUpdate;
   const queueFailurePrisma = createPrisma(createCampaign([
      {
         id: "campaign-recipient-id",
         contact: {
            email: "ada@example.com",
            first_name: "Ada",
            last_name: "Lovelace"
         }
      }
   ]));
   queueFailurePrisma.campaign_sends.update = async ({ data }) => {
      failedRunUpdate = data;
   };

   const queueFailure = loadCampaignSendService(
      queueFailurePrisma,
      async () => {
         throw new Error("Redis is unavailable");
      }
   );
   context.after(() => queueFailure.restore());

   await assert.rejects(
      () => queueFailure.service.createCampaignSend("campaign-id", "user-id"),
      (error) => error.status === 503
   );

   assert.equal(failedRunUpdate.status, "FAILED");
   assert.equal(failedRunUpdate.active_key, null);
});

test("cancelCampaignSend removes a queued job and preserves delivery counts", async (context) => {
   const prisma = createCancellationPrisma();
   let removeCalls = 0;
   const serviceModule = loadCampaignSendService(
      prisma,
      async () => null,
      async (campaignSendId) => {
         removeCalls += 1;
         assert.equal(campaignSendId, "send-id");
         return "removed";
      }
   );
   context.after(() => serviceModule.restore());

   const campaignSend = await serviceModule.service.cancelCampaignSend(
      "campaign-id",
      "send-id",
      "user-id"
   );

   assert.equal(removeCalls, 1);
   assert.equal(campaignSend.status, "CANCELLED");
   assert.equal(campaignSend.active_key, null);
   assert.equal(campaignSend.accepted_count, 1);
   assert.equal(campaignSend.failed_count, 1);
   assert.ok(campaignSend.completed_at);
});

test("cancelCampaignSend requests cancellation for processing sends idempotently", async (context) => {
   const prisma = createCancellationPrisma("PROCESSING");
   let removeCalls = 0;
   const serviceModule = loadCampaignSendService(
      prisma,
      async () => null,
      async () => {
         removeCalls += 1;
         return "removed";
      }
   );
   context.after(() => serviceModule.restore());

   const campaignSend = await serviceModule.service.cancelCampaignSend(
      "campaign-id",
      "send-id",
      "user-id"
   );
   const repeatedRequest = await serviceModule.service.cancelCampaignSend(
      "campaign-id",
      "send-id",
      "user-id"
   );

   assert.equal(removeCalls, 0);
   assert.equal(campaignSend.status, "CANCEL_REQUESTED");
   assert.equal(repeatedRequest.status, "CANCEL_REQUESTED");
   assert.equal(campaignSend.active_key, "campaign-id");
});

test("cancelCampaignSend enforces ownership and rejects terminal sends", async (context) => {
   const otherUserModule = loadCampaignSendService(
      createCancellationPrisma("QUEUED", "other-user-id"),
      async () => null
   );
   context.after(() => otherUserModule.restore());

   await assert.rejects(
      () => otherUserModule.service.cancelCampaignSend(
         "campaign-id",
         "send-id",
         "user-id"
      ),
      (error) => error.status === 404
   );

   otherUserModule.restore();

   const terminalModule = loadCampaignSendService(
      createCancellationPrisma("COMPLETED"),
      async () => null
   );
   context.after(() => terminalModule.restore());

   await assert.rejects(
      () => terminalModule.service.cancelCampaignSend(
         "campaign-id",
         "send-id",
         "user-id"
      ),
      (error) => error.status === 409
   );
});
