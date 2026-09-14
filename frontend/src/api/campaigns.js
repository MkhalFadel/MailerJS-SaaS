import apiRequest from "./api";

function mapTemplate(template)
{
   if(!template)
      return null;

   return {
      id: template.id,
      name: template.name,
      subject: template.subject,
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

export function sendCampaign(id)
{
   return apiRequest(`/campaigns/${id}/send`, {
      method: "POST"
   });
}

export async function getCampaignDeliveries(campaignId)
{
   const response = await apiRequest(`/campaigns/${campaignId}/deliveries`);

   return {
      ...response,
      data: response.data.map((delivery) => ({
         id: delivery.id,
         status: delivery.status,
         errorMessage: delivery.error_message,
         sentAt: delivery.sent_at,
         createdAt: delivery.created_at,
         contact: mapContact(delivery.contact)
      }))
   };
}
