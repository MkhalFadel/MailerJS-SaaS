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
let workerStartPromise;
let shuttingDown = false;

function registerWorkerHandlers(campaignWorker)
{
   campaignWorker.on("failed", async (job, error) => {
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

   campaignWorker.on("error", (error) => {
      console.error("Campaign worker error:", error.message);
   });
}

async function initializeCampaignWorker()
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

   registerWorkerHandlers(worker);

   try {
      await worker.waitUntilReady();
      await recoverQueuedCampaignSends();

      recoveryInterval = setInterval(() => {
         recoverQueuedCampaignSends().catch((error) => {
            console.error("Failed to recover queued campaign sends:", error.message);
         });
      }, 60000);

      console.info("Campaign worker is running");
      return worker;
   } catch(error) {
      await closeCampaignWorker();
      throw error;
   }
}

function startCampaignWorker()
{
   if(workerStartPromise)
      return workerStartPromise;

   if(worker)
      return Promise.resolve(worker);

   workerStartPromise = initializeCampaignWorker();
   return workerStartPromise;
}

async function closeCampaignWorker()
{
   if(recoveryInterval)
      clearInterval(recoveryInterval);

   recoveryInterval = null;

   const activeWorker = worker;
   const activeConnection = workerConnection;

   worker = null;
   workerConnection = null;
   workerStartPromise = null;

   try {
      if(activeWorker)
         await activeWorker.close();
   } finally {
      await closeRedisConnection(activeConnection);
   }
}

async function shutdown(signal)
{
   if(shuttingDown)
      return;

   shuttingDown = true;
   console.info(`Campaign worker received ${signal}, shutting down`);

   try {
      await closeCampaignWorker();
      await closeCampaignQueue();
      await prisma.$disconnect();
   } catch(error) {
      console.error("Campaign worker shutdown error:", error.message);
      process.exitCode = 1;
   }
}

if(require.main === module)
{
   process.once("SIGINT", () => shutdown("SIGINT"));
   process.once("SIGTERM", () => shutdown("SIGTERM"));

   startCampaignWorker().catch(async (error) => {
      console.error("Campaign worker could not start:", error.message);
      await shutdown("startup failure");
      process.exitCode = 1;
   });
}

module.exports = {
   startCampaignWorker,
   closeCampaignWorker
};
