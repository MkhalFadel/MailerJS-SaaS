const { Queue } = require("bullmq");
const { createRedisConnection, closeRedisConnection } = require("./redis");

const CAMPAIGN_QUEUE_NAME = "campaign-sends";

let campaignQueue;
let queueConnection;

function getCampaignQueue()
{
   if(campaignQueue)
      return campaignQueue;

   queueConnection = createRedisConnection("web");
   campaignQueue = new Queue(CAMPAIGN_QUEUE_NAME, {
      connection: queueConnection
   });

   return campaignQueue;
}

async function enqueueCampaignSend(campaignSendId)
{
   return getCampaignQueue().add(
      "send-campaign",
      {
         campaignSendId
      },
      {
         jobId: `campaign-send-${campaignSendId}`,
         attempts: 3,
         backoff: {
            type: "exponential",
            delay: 3000
         },
         removeOnComplete: 100,
         removeOnFail: 100
      }
   );
}

async function closeCampaignQueue()
{
   if(campaignQueue)
      await campaignQueue.close();

   await closeRedisConnection(queueConnection);
   campaignQueue = null;
   queueConnection = null;
}

module.exports = {
   CAMPAIGN_QUEUE_NAME,
   enqueueCampaignSend,
   closeCampaignQueue
};
