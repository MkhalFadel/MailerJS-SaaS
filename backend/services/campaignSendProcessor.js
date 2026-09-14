const prisma = require("../lib/prisma");
const { createTransporter, sendEmail } = require("./smtpService");
const { renderTemplate } = require("../utils/templateRenderer");
const { getCampaignConfigurationError } = require("./campaignSendService");

function getSafeErrorMessage(error)
{
   return (error.message || "Campaign send failed")
      .replace(/\s+/g, " ")
      .slice(0, 500);
}

async function refreshCampaignSendCounts(campaignSendId)
{
   const [acceptedCount, failedCount] = await Promise.all([
      prisma.campaign_deliveries.count({
         where: {
            campaign_send_id: campaignSendId,
            status: "accepted"
         }
      }),
      prisma.campaign_deliveries.count({
         where: {
            campaign_send_id: campaignSendId,
            status: "failed"
         }
      })
   ]);

   return prisma.campaign_sends.update({
      where: {
         id: campaignSendId
      },
      data: {
         accepted_count: acceptedCount,
         failed_count: failedCount
      }
   });
}

async function markCampaignSendFailed(campaignSendId, error)
{
   const errorMessage = getSafeErrorMessage(error);

   await prisma.campaign_sends.updateMany({
      where: {
         id: campaignSendId,
         status: {
            in: ["QUEUED", "PROCESSING"]
         }
      },
      data: {
         status: "FAILED",
         active_key: null,
         error_message: errorMessage,
         completed_at: new Date()
      }
   });

   console.error(
      `Campaign send ${campaignSendId} failed:`,
      errorMessage
   );
}

async function processCampaignSend(campaignSendId)
{
   await prisma.campaign_sends.updateMany({
      where: {
         id: campaignSendId,
         status: "QUEUED"
      },
      data: {
         status: "PROCESSING",
         started_at: new Date()
      }
   });

   const campaignSend = await prisma.campaign_sends.findUnique({
      where: {
         id: campaignSendId
      }
   });

   if(
      !campaignSend ||
      ["COMPLETED", "COMPLETED_WITH_ERRORS", "FAILED"].includes(
         campaignSend.status
      )
   )
      return;

   console.info(`Campaign worker started send ${campaignSendId}`);

   const campaign = await prisma.campaigns.findUnique({
      where: {
         id: campaignSend.campaign_id
      },
      include: {
         template: true,
         smtp_account: true
      }
   });

   if(!campaign)
   {
      await markCampaignSendFailed(
         campaignSendId,
         new Error("Campaign configuration is no longer available")
      );
      return;
   }

   const configurationError = getCampaignConfigurationError(campaign);

   if(configurationError)
   {
      await markCampaignSendFailed(
         campaignSendId,
         new Error(configurationError)
      );
      return;
   }

   const transporter = createTransporter(campaign.smtp_account);
   const deliveries = await prisma.campaign_deliveries.findMany({
      where: {
         campaign_send_id: campaignSendId,
         status: {
            not: "accepted"
         }
      },
      orderBy: {
         created_at: "asc"
      }
   });

   for(const delivery of deliveries)
   {
      if(!delivery.recipient_email)
      {
         await prisma.campaign_deliveries.updateMany({
            where: {
               id: delivery.id,
               status: {
                  not: "accepted"
               }
            },
            data: {
               status: "failed",
               error_message: "Recipient email is unavailable"
            }
         });

         await refreshCampaignSendCounts(campaignSendId);
         continue;
      }

      const recipient = {
         email: delivery.recipient_email,
         first_name: delivery.recipient_first_name,
         last_name: delivery.recipient_last_name
      };

      try {
         await sendEmail(transporter, {
            senderName: campaign.smtp_account.sender_name,
            senderEmail: campaign.smtp_account.sender_email,
            recipient: delivery.recipient_email,
            subject: renderTemplate(campaign.subject, recipient),
            html: renderTemplate(campaign.template.content, recipient)
         });

         await prisma.campaign_deliveries.updateMany({
            where: {
               id: delivery.id,
               status: {
                  not: "accepted"
               }
            },
            data: {
               status: "accepted",
               error_message: null,
               sent_at: new Date()
            }
         });
      } catch(error) {
         await prisma.campaign_deliveries.updateMany({
            where: {
               id: delivery.id,
               status: {
                  not: "accepted"
               }
            },
            data: {
               status: "failed",
               error_message: getSafeErrorMessage(error),
               sent_at: null
            }
         });
      }

      await refreshCampaignSendCounts(campaignSendId);
   }

   const completedSend = await refreshCampaignSendCounts(campaignSendId);
   const processedCount =
      completedSend.accepted_count + completedSend.failed_count;

   if(processedCount !== completedSend.total_recipients)
      throw new Error("Campaign send has unfinished recipients");

   const status = completedSend.failed_count === 0
      ? "COMPLETED"
      : "COMPLETED_WITH_ERRORS";

   await prisma.campaign_sends.update({
      where: {
         id: campaignSendId
      },
      data: {
         status,
         active_key: null,
         completed_at: new Date(),
         error_message: null
      }
   });

   console.info(`Campaign worker completed send ${campaignSendId}`);
}

module.exports = {
   markCampaignSendFailed,
   processCampaignSend,
   refreshCampaignSendCounts
};
