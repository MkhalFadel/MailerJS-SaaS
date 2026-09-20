const { startCampaignWorker } = require("../workers/campaignWorker");

function isCampaignWorkerInApiEnabled()
{
   return process.env.RUN_CAMPAIGN_WORKER_IN_API === "true";
}

async function startCampaignWorkerInApiProcess({
   startWorker = startCampaignWorker,
   logger = console
} = {})
{
   if(!isCampaignWorkerInApiEnabled())
      return null;

   const worker = await startWorker();
   logger.info("Campaign worker started inside API process");
   return worker;
}

module.exports = {
   isCampaignWorkerInApiEnabled,
   startCampaignWorkerInApiProcess
};
