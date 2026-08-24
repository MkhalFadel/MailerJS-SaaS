import apiRequest from "./api";

function mapTemplate(template)
{
   return {
      id: template.id,
      name: template.name,
      subject: template.subject,
      content: template.content,
      createdAt: template.created_at,
      updatedAt: template.updated_at
   };
}

export async function getTemplates()
{
   const response = await apiRequest("/templates");

   return {
      ...response,
      data: response.data.map(mapTemplate)
   };
}

export async function createTemplate(template)
{
   const response = await apiRequest("/templates",{
      method: "POST",
      body: JSON.stringify(template)
   });

   return {
      ...response,
      data: mapTemplate(response.data)
   };
}

export async function updateTemplate(id,template)
{
   const response = await apiRequest(`/templates/${id}`,{
      method: "PUT",
      body: JSON.stringify(template)
   });

   return {
      ...response,
      data: mapTemplate(response.data)
   };
}

export function deleteTemplate(id)
{
   return apiRequest(`/templates/${id}`,{
      method: "DELETE"
   });
}