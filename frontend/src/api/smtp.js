import apiRequest from "./api";

function mapSmtpAccount(account)
{
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

export async function getSmtpAccounts()
{
   const response = await apiRequest("/smtp");

   return {
      ...response,
      data: response.data.map(mapSmtpAccount)
   };
}

export async function createSmtpAccount(account)
{
   const response = await apiRequest("/smtp",{
      method: "POST",
      body: JSON.stringify(account)
   });

   return {
      ...response,
      data: mapSmtpAccount(response.data)
   };
}

export async function updateSmtpAccount(id, account)
{
   const response = await apiRequest(`/smtp/${id}`,{
      method: "PUT",
      body: JSON.stringify(account)
   });

   return {
      ...response,
      data: mapSmtpAccount(response.data)
   };
}

export function deleteSmtpAccount(id)
{
   return apiRequest(`/smtp/${id}`,{
      method: "DELETE"
   });
}

export function testSmtpConnection(id)
{
   return apiRequest(`/smtp/${id}/test`,{
      method: "POST"
   });
}