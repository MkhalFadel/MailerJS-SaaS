const assert = require("node:assert/strict");
const test = require("node:test");

function loadCampaignSendProcessor(prisma, sendEmail)
{
   const processorPath = require.resolve("../services/campaignSendProcessor");
   const prismaPath = require.resolve("../lib/prisma");
   const smtpPath = require.resolve("../services/smtpService");
   const rendererPath = require.resolve("../utils/templateRenderer");
   const sendServicePath = require.resolve("../services/campaignSendService");
   const cachedModules = new Map([
      [processorPath, require.cache[processorPath]],
      [prismaPath, require.cache[prismaPath]],
      [smtpPath, require.cache[smtpPath]],
      [rendererPath, require.cache[rendererPath]],
      [sendServicePath, require.cache[sendServicePath]]
   ]);

   require.cache[prismaPath] = {
      exports: prisma
   };
   require.cache[smtpPath] = {
      exports: {
         createTransporter: () => ({}),
         sendEmail
      }
   };
   require.cache[rendererPath] = {
      exports: {
         renderTemplate: (content) => content
      }
   };
   require.cache[sendServicePath] = {
      exports: {
         getCampaignConfigurationError: () => null,
         finalizeCampaignSendCancellation: async (campaignSendId) => {
            const acceptedCount = await prisma.campaign_deliveries.count({
               where: {
                  campaign_send_id: campaignSendId,
                  status: "accepted"
               }
            });
            const failedCount = await prisma.campaign_deliveries.count({
               where: {
                  campaign_send_id: campaignSendId,
                  status: "failed"
               }
            });

            await prisma.campaign_sends.updateMany({
               where: {
                  id: campaignSendId,
                  status: "CANCEL_REQUESTED"
               },
               data: {
                  status: "CANCELLED",
                  active_key: null,
                  accepted_count: acceptedCount,
                  failed_count: failedCount,
                  completed_at: new Date()
               }
            });

            return prisma.campaign_sends.findUnique({
               where: {
                  id: campaignSendId
               }
            });
         }
      }
   };
   delete require.cache[processorPath];

   const processor = require(processorPath);

   return {
      processor,
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

function createPrisma(deliveries)
{
   const campaignSend = {
      id: "send-id",
      campaign_id: "campaign-id",
      active_key: "campaign-id",
      status: "QUEUED",
      total_recipients: deliveries.length,
      accepted_count: 0,
      failed_count: 0
   };

   const campaign = {
      id: "campaign-id",
      subject: "Hello",
      template: {
         content: "Hello"
      },
      smtp_account: {
         sender_name: "Mailer",
         sender_email: "mailer@example.com"
      }
   };

   function matchesStatus(status, condition)
   {
      if(!condition)
         return true;

      if(condition.not)
         return status !== condition.not;

      if(condition.in)
         return condition.in.includes(status);

      return status === condition;
   }

   return {
      campaign_sends: {
         updateMany: async ({ where, data }) => {
            if(
               where.id !== campaignSend.id ||
               !matchesStatus(campaignSend.status, where.status)
            )
               return { count: 0 };

            Object.assign(campaignSend, data);
            return { count: 1 };
         },
         findUnique: async () => campaignSend,
         update: async ({ data }) => {
            Object.assign(campaignSend, data);
            return campaignSend;
         }
      },
      campaigns: {
         findUnique: async () => campaign
      },
      campaign_deliveries: {
         findMany: async () => deliveries.filter(
            delivery => delivery.status !== "accepted"
         ),
         updateMany: async ({ where, data }) => {
            const delivery = deliveries.find(
               item => item.id === where.id
            );

            if(!delivery || !matchesStatus(delivery.status, where.status))
               return { count: 0 };

            Object.assign(delivery, data);
            return { count: 1 };
         },
         count: async ({ where }) => deliveries.filter(
            delivery =>
               delivery.campaign_send_id === where.campaign_send_id &&
               delivery.status === where.status
         ).length
      }
   };
}

test("worker skips accepted recipients when a send is retried", async (context) => {
   const deliveries = [
      {
         id: "accepted-delivery",
         campaign_send_id: "send-id",
         recipient_email: "accepted@example.com",
         status: "accepted"
      },
      {
         id: "pending-delivery",
         campaign_send_id: "send-id",
         recipient_email: "pending@example.com",
         status: "pending"
      }
   ];
   const sentRecipients = [];
   const prisma = createPrisma(deliveries);
   const processorModule = loadCampaignSendProcessor(
      prisma,
      async (transporter, data) => {
         sentRecipients.push(data.recipient);
      }
   );
   context.after(() => processorModule.restore());

   await processorModule.processor.processCampaignSend("send-id");

   assert.deepEqual(sentRecipients, ["pending@example.com"]);
   assert.equal(deliveries[1].status, "accepted");
   assert.equal(
      (await prisma.campaign_sends.findUnique()).status,
      "COMPLETED"
   );
});

test("worker records recipient failures and completes remaining recipients", async (context) => {
   const deliveries = [
      {
         id: "failed-delivery",
         campaign_send_id: "send-id",
         recipient_email: "failed@example.com",
         status: "pending"
      },
      {
         id: "accepted-delivery",
         campaign_send_id: "send-id",
         recipient_email: "accepted@example.com",
         status: "pending"
      }
   ];
   const prisma = createPrisma(deliveries);
   const processorModule = loadCampaignSendProcessor(
      prisma,
      async (transporter, data) => {
         if(data.recipient === "failed@example.com")
            throw new Error("Recipient rejected");
      }
   );
   context.after(() => processorModule.restore());

   await processorModule.processor.processCampaignSend("send-id");

   assert.equal(deliveries[0].status, "failed");
   assert.equal(deliveries[1].status, "accepted");
   assert.equal(
      (await prisma.campaign_sends.findUnique()).status,
      "COMPLETED_WITH_ERRORS"
   );
});

test("worker finalizes cancellation without attempting remaining recipients", async (context) => {
   const deliveries = [
      {
         id: "accepted-delivery",
         campaign_send_id: "send-id",
         recipient_email: "accepted@example.com",
         status: "pending"
      },
      {
         id: "pending-delivery",
         campaign_send_id: "send-id",
         recipient_email: "pending@example.com",
         status: "pending"
      }
   ];
   const sentRecipients = [];
   const prisma = createPrisma(deliveries);
   const campaignSend = await prisma.campaign_sends.findUnique();
   const processorModule = loadCampaignSendProcessor(
      prisma,
      async (transporter, data) => {
         sentRecipients.push(data.recipient);
         campaignSend.status = "CANCEL_REQUESTED";
      }
   );
   context.after(() => processorModule.restore());

   await processorModule.processor.processCampaignSend("send-id");

   assert.deepEqual(sentRecipients, ["accepted@example.com"]);
   assert.equal(deliveries[0].status, "accepted");
   assert.equal(deliveries[1].status, "pending");
   assert.equal(campaignSend.status, "CANCELLED");
   assert.equal(campaignSend.active_key, null);
   assert.equal(campaignSend.accepted_count, 1);
   assert.equal(campaignSend.failed_count, 0);
});
