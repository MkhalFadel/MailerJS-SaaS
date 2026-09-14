const prisma = require("../lib/prisma");
const { enqueueCampaignSend } = require("../queues/campaignQueue");

class CampaignSendError extends Error
{
   constructor(message, status)
   {
      super(message);
      this.status = status;
   }
}

function serializeCampaignSend(campaignSend)
{
   return {
      id: campaignSend.id,
      campaign_id: campaignSend.campaign_id,
      status: campaignSend.status,
      total_recipients: campaignSend.total_recipients,
      accepted_count: campaignSend.accepted_count,
      failed_count: campaignSend.failed_count,
      error_message: campaignSend.error_message,
      created_at: campaignSend.created_at,
      started_at: campaignSend.started_at,
      completed_at: campaignSend.completed_at
   };
}

function getCampaignConfigurationError(campaign)
{
   if(!campaign.template || !campaign.template.content)
      return "Campaign template is not configured";

   if(
      !campaign.smtp_account ||
      !campaign.smtp_account.host ||
      !campaign.smtp_account.username ||
      !campaign.smtp_account.password_encrypted ||
      !campaign.smtp_account.sender_email
   )
      return "Campaign SMTP account is not configured";

   return null;
}

async function createCampaignSend(campaignId, userId)
{
   let campaignSend;

   try {
      campaignSend = await prisma.$transaction(async (transaction) => {
         const campaign = await transaction.campaigns.findFirst({
            where: {
               id: campaignId,
               user_id: userId
            },
            include: {
               template: true,
               smtp_account: true,
               recipients: {
                  include: {
                     contact: true
                  }
               }
            }
         });

         if(!campaign)
            throw new CampaignSendError("Campaign not found", 404);

         const configurationError = getCampaignConfigurationError(campaign);

         if(configurationError)
            throw new CampaignSendError(configurationError, 400);

         if(campaign.recipients.length === 0)
            throw new CampaignSendError("Campaign has no recipients", 400);

         const activeSend = await transaction.campaign_sends.findFirst({
            where: {
               campaign_id: campaign.id,
               active_key: campaign.id
            }
         });

         if(activeSend)
            throw new CampaignSendError(
               "Campaign already has a send in progress",
               409
            );

         return transaction.campaign_sends.create({
            data: {
               campaign_id: campaign.id,
               active_key: campaign.id,
               total_recipients: campaign.recipients.length,
               deliveries: {
                  create: campaign.recipients.map((recipient) => ({
                     campaign_recipient_id: recipient.id,
                     recipient_email: recipient.contact.email,
                     recipient_first_name: recipient.contact.first_name,
                     recipient_last_name: recipient.contact.last_name,
                     status: "pending"
                  }))
               }
            }
         });
      });
   } catch(error) {
      if(error instanceof CampaignSendError)
         throw error;

      if(error.code === "P2002")
      {
         throw new CampaignSendError(
            "Campaign already has a send in progress",
            409
         );
      }

      throw error;
   }

   try {
      await enqueueCampaignSend(campaignSend.id);
   } catch(error) {
      console.error("Failed to queue campaign send:", error.message);

      try {
         await prisma.campaign_sends.update({
            where: {
               id: campaignSend.id
            },
            data: {
               status: "FAILED",
               active_key: null,
               error_message: "Campaign send could not be queued",
               completed_at: new Date()
            }
         });
      } catch(updateError) {
         console.error(
            "Failed to record campaign queue error:",
            updateError.message
         );
      }

      throw new CampaignSendError(
         "Campaign send queue is unavailable. Please try again.",
         503
      );
   }

   console.info(`Campaign send ${campaignSend.id} queued`);

   return campaignSend;
}

async function getCampaignSends(campaignId, userId)
{
   const campaign = await prisma.campaigns.findFirst({
      where: {
         id: campaignId,
         user_id: userId
      },
      select: {
         id: true
      }
   });

   if(!campaign)
      throw new CampaignSendError("Campaign not found", 404);

   return prisma.campaign_sends.findMany({
      where: {
         campaign_id: campaign.id
      },
      orderBy: {
         created_at: "desc"
      }
   });
}

async function getCampaignSend(campaignId, campaignSendId, userId)
{
   const campaignSend = await prisma.campaign_sends.findFirst({
      where: {
         id: campaignSendId,
         campaign_id: campaignId,
         campaign: {
            user_id: userId
         }
      }
   });

   if(!campaignSend)
      throw new CampaignSendError("Campaign send not found", 404);

   return campaignSend;
}

async function recoverQueuedCampaignSends()
{
   const campaignSends = await prisma.campaign_sends.findMany({
      where: {
         status: "QUEUED"
      },
      select: {
         id: true
      }
   });

   for(const campaignSend of campaignSends)
   {
      try {
         await enqueueCampaignSend(campaignSend.id);
      } catch(error) {
         console.error(
            `Failed to recover campaign send ${campaignSend.id}:`,
            error.message
         );
      }
   }
}

module.exports = {
   CampaignSendError,
   createCampaignSend,
   getCampaignConfigurationError,
   getCampaignSend,
   getCampaignSends,
   recoverQueuedCampaignSends,
   serializeCampaignSend
};
