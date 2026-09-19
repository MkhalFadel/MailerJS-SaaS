require("dotenv").config();

const { Worker } = require("bullmq");
const prisma = require("../lib/prisma");
const {
   CAMPAIGN_QUEUE_NAME,
   closeCampaignQueue
} = require("../queues/campaignQueue");
const { createRedisConnection, closeRedisConnection } = require("../queues/redis");
const {
   finalizeCampaignSendCancellation,
   recoverQueuedCampaignSends
} = require("../services/campaignSendService");
const {
   markCampaignSendFailed,
   processCampaignSend
} = require("../services/campaignSendProcessor");

let worker;
let workerConnection;
let recoveryInterval;
let shuttingDown = false;

async function startWorker()
{
   workerConnection = createRedisConnection("worker");
   worker = new Worker(
      CAMPAIGN_QUEUE_NAME,
      async (job) => {
         const { campaignSendId } = job.data;

         if(!campaignSendId)
            throw new Error("Campaign send job is missing a campaignSendId");

         await processCampaignSend(campaignSendId);
      },
      {
         connection: workerConnection,
         concurrency: 1
      }
   );

   worker.on("failed", async (job, error) => {
      if(!job)
      {
         console.error("Campaign worker job failed:", error.message);
         return;
      }

      const attempts = job.opts.attempts || 1;

      if(job.attemptsMade < attempts)
      {
         console.error(
            `Campaign send ${job.data.campaignSendId} failed and will retry:`,
            error.message
         );
         return;
      }

      try {
         const campaignSend = await prisma.campaign_sends.findUnique({
            where: {
               id: job.data.campaignSendId
            }
         });

         if(campaignSend?.status === "CANCEL_REQUESTED")
         {
            await finalizeCampaignSendCancellation(campaignSend.id);
            return;
         }

         await markCampaignSendFailed(job.data.campaignSendId, error);
      } catch(updateError) {
         console.error(
            "Failed to record campaign worker failure:",
            updateError.message
         );
      }
   });

   worker.on("error", (error) => {
      console.error("Campaign worker error:", error.message);
   });

   await worker.waitUntilReady();
   await recoverQueuedCampaignSends();

   recoveryInterval = setInterval(() => {
      recoverQueuedCampaignSends().catch((error) => {
         console.error("Failed to recover queued campaign sends:", error.message);
      });
   }, 60000);

   console.info("Campaign worker is running");
}

async function shutdown(signal)
{
   if(shuttingDown)
      return;

   shuttingDown = true;
   console.info(`Campaign worker received ${signal}, shutting down`);

   try {
      clearInterval(recoveryInterval);

      if(worker)
         await worker.close();

      await closeCampaignQueue();
      await closeRedisConnection(workerConnection);
      await prisma.$disconnect();
   } catch(error) {
      console.error("Campaign worker shutdown error:", error.message);
      process.exitCode = 1;
   }
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

startWorker().catch(async (error) => {
   console.error("Campaign worker could not start:", error.message);
   await closeRedisConnection(workerConnection);
   await prisma.$disconnect();
   process.exit(1);
});
