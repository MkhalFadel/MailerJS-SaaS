const prisma = require("../lib/prisma");

function serializeLatestSend(campaignSend)
{
   if(!campaignSend)
      return null;

   return {
      id: campaignSend.id,
      status: campaignSend.status,
      total_recipients: campaignSend.total_recipients,
      accepted_count: campaignSend.accepted_count,
      failed_count: campaignSend.failed_count,
      created_at: campaignSend.created_at,
      started_at: campaignSend.started_at,
      completed_at: campaignSend.completed_at
   };
}

async function getDashboard(userId)
{
   const deliveryWhere = (status) => ({
      status,
      OR: [
         {
            campaign_send: {
               campaign: {
                  user_id: userId
               }
            }
         },
         {
            campaign_recipient: {
               campaign: {
                  user_id: userId
               }
            }
         }
      ]
   });

   const [
      totalContacts,
      totalCampaigns,
      totalTemplates,
      totalSmtpAccounts,
      acceptedEmails,
      failedEmails,
      campaigns
   ] = await Promise.all([
      prisma.contacts.count({
         where: {
            user_id: userId
         }
      }),
      prisma.campaigns.count({
         where: {
            user_id: userId
         }
      }),
      prisma.templates.count({
         where: {
            user_id: userId
         }
      }),
      prisma.smtp_accounts.count({
         where: {
            user_id: userId
         }
      }),
      prisma.campaign_deliveries.count({
         where: deliveryWhere("accepted")
      }),
      prisma.campaign_deliveries.count({
         where: deliveryWhere("failed")
      }),
      prisma.campaigns.findMany({
         where: {
            user_id: userId
         },
         select: {
            id: true,
            name: true,
            subject: true,
            created_at: true,
            _count: {
               select: {
                  recipients: true
               }
            },
            sends: {
               take: 1,
               orderBy: {
                  created_at: "desc"
               },
               select: {
                  id: true,
                  status: true,
                  total_recipients: true,
                  accepted_count: true,
                  failed_count: true,
                  created_at: true,
                  started_at: true,
                  completed_at: true
               }
            }
         },
         orderBy: {
            created_at: "desc"
         },
         take: 5
      })
   ]);

   const deliveryAttempts = acceptedEmails + failedEmails;
   const successRate = deliveryAttempts === 0
      ? 0
      : Number(((acceptedEmails / deliveryAttempts) * 100).toFixed(1));

   return {
      stats: {
         total_contacts: totalContacts,
         total_campaigns: totalCampaigns,
         total_templates: totalTemplates,
         total_smtp_accounts: totalSmtpAccounts,
         accepted_emails: acceptedEmails,
         failed_emails: failedEmails,
         success_rate: successRate
      },
      recent_campaigns: campaigns.map((campaign) => ({
         id: campaign.id,
         name: campaign.name,
         subject: campaign.subject,
         created_at: campaign.created_at,
         recipient_count: campaign._count.recipients,
         latest_send: serializeLatestSend(campaign.sends[0])
      }))
   };
}

module.exports = { getDashboard };
