import apiRequest from "./api";

function mapTemplate(template)
{
   if(!template)
      return null;

   return {
      id: template.id,
      name: template.name,
      content: template.content,
      createdAt: template.created_at,
      updatedAt: template.updated_at
   };
}

function mapSmtpAccount(account)
{
   if(!account)
      return null;

   return {
      id: account.id,
      provider: account.provider,
      host: account.host,
      port: account.port,
      secure: account.secure,
      username: account.username,
      senderName: account.sender_name || "",
      senderEmail: account.sender_email,
      isDefault: account.is_default,
      createdAt: account.created_at,
      updatedAt: account.updated_at
   };
}

function mapContact(contact)
{
   if(!contact)
      return null;

   return {
      id: contact.id,
      email: contact.email,
      firstName: contact.first_name || "",
      lastName: contact.last_name || ""
   };
}

function mapCampaign(campaign)
{
   return {
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      templateId: campaign.template_id,
      smtpAccountId: campaign.smtp_account_id,
      recipients: campaign.recipients || 0,
      accepted: campaign.accepted ?? campaign.sent ?? 0,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
      template: mapTemplate(campaign.template),
      smtpAccount: mapSmtpAccount(campaign.smtp_account)
   };
}

function mapCampaignSend(campaignSend)
{
   return {
      id: campaignSend.id,
      campaignId: campaignSend.campaign_id,
      status: campaignSend.status,
      totalRecipients: campaignSend.total_recipients,
      acceptedCount: campaignSend.accepted_count,
      failedCount: campaignSend.failed_count,
      errorMessage: campaignSend.error_message,
      createdAt: campaignSend.created_at,
      startedAt: campaignSend.started_at,
      completedAt: campaignSend.completed_at
   };
}

export async function getCampaigns()
{
   const response = await apiRequest("/campaigns");

   return {
      ...response,
      data: response.data.map(mapCampaign)
   };
}

export async function getCampaign(id)
{
   const response = await apiRequest(`/campaigns/${id}`);

   return {
      ...response,
      data: mapCampaign(response.data)
   };
}

export async function createCampaign(campaign)
{
   const response = await apiRequest("/campaigns", {
      method: "POST",
      body: JSON.stringify(campaign)
   });

   return {
      ...response,
      data: mapCampaign(response.data)
   };
}

export async function updateCampaign(id, campaign)
{
   const response = await apiRequest(`/campaigns/${id}`, {
      method: "PUT",
      body: JSON.stringify(campaign)
   });

   return {
      ...response,
      data: mapCampaign(response.data)
   };
}

export function deleteCampaign(id)
{
   return apiRequest(`/campaigns/${id}`, {
      method: "DELETE"
   });
}

export async function addCampaignRecipients(campaignId, contactIds)
{
   return apiRequest(`/campaigns/${campaignId}/recipients`, {
      method: "POST",
      body: JSON.stringify({
         contactIds
      })
   });
}

export async function getCampaignRecipients(campaignId)
{
   const response = await apiRequest(`/campaigns/${campaignId}/recipients`);

   return {
      ...response,
      data: response.data.map((recipient) => ({
         id: recipient.id,
         campaignId: recipient.campaign_id,
         contactId: recipient.contact_id,
         createdAt: recipient.created_at,
         updatedAt: recipient.updated_at,
         contact: mapContact(recipient.contact)
      }))
   };
}

export function deleteCampaignRecipient(campaignId, contactId)
{
   return apiRequest(
      `/campaigns/${campaignId}/recipients/${contactId}`, {
         method: "DELETE"
      }
   );
}

export async function sendCampaign(id)
{
   const response = await apiRequest(`/campaigns/${id}/send`, {
      method: "POST"
   });

   return {
      ...response,
      data: mapCampaignSend(response.data)
   };
}

export async function getCampaignSends(campaignId)
{
   const response = await apiRequest(`/campaigns/${campaignId}/sends`);

   return {
      ...response,
      data: response.data.map(mapCampaignSend)
   };
}

export async function getCampaignSend(campaignId, campaignSendId)
{
   const response = await apiRequest(
      `/campaigns/${campaignId}/sends/${campaignSendId}`
   );

   return {
      ...response,
      data: mapCampaignSend(response.data)
   };
}

export async function cancelCampaignSend(campaignId, campaignSendId)
{
   const response = await apiRequest(
      `/campaigns/${campaignId}/sends/${campaignSendId}/cancel`,
      {
         method: "POST"
      }
   );

   return {
      ...response,
      data: mapCampaignSend(response.data)
   };
}

export async function getCampaignDeliveries(campaignId)
{
   const response = await apiRequest(`/campaigns/${campaignId}/deliveries`);

   return {
      ...response,
      data: response.data.map((delivery) => ({
         id: delivery.id,
         campaignSendId: delivery.campaign_send_id,
         campaignSendCreatedAt: delivery.campaign_send_created_at,
         campaignSendStatus: delivery.campaign_send_status,
         status: delivery.status,
         errorMessage: delivery.error_message,
         sentAt: delivery.sent_at,
         createdAt: delivery.created_at,
         contact: mapContact(delivery.contact)
      }))
   };
}
