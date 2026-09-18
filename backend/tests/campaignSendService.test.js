const assert = require("node:assert/strict");
const test = require("node:test");

function loadCampaignSendService(prisma, enqueueCampaignSend)
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
         enqueueCampaignSend
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
