import apiRequest from "./api";

function mapCampaignSend(campaignSend)
{
   if(!campaignSend)
      return null;

   return {
      id: campaignSend.id,
      status: campaignSend.status,
      totalRecipients: campaignSend.total_recipients,
      acceptedCount: campaignSend.accepted_count,
      failedCount: campaignSend.failed_count,
      createdAt: campaignSend.created_at,
      startedAt: campaignSend.started_at,
      completedAt: campaignSend.completed_at
   };
}

function mapDashboard(dashboard)
{
   return {
      stats: {
         totalContacts: dashboard.stats.total_contacts,
         totalCampaigns: dashboard.stats.total_campaigns,
         totalTemplates: dashboard.stats.total_templates,
         totalSmtpAccounts: dashboard.stats.total_smtp_accounts,
         acceptedEmails: dashboard.stats.accepted_emails,
         failedEmails: dashboard.stats.failed_emails,
         successRate: dashboard.stats.success_rate
      },
      recentCampaigns: dashboard.recent_campaigns.map((campaign) => ({
         id: campaign.id,
         name: campaign.name,
         subject: campaign.subject,
         templateId: campaign.template_id,
         createdAt: campaign.created_at,
         recipientCount: campaign.recipient_count,
         latestSend: mapCampaignSend(campaign.latest_send)
      }))
   };
}

export async function getDashboard()
{
   const response = await apiRequest("/dashboard");

   return {
      ...response,
      data: mapDashboard(response.data)
   };
}
