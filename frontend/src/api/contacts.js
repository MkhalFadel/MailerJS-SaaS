import apiRequest from "./api";

function mapContact(contact)
{
   return {
      id: contact.id,
      email: contact.email,
      firstName: contact.first_name || "",
      lastName: contact.last_name || ""
   };
}

export async function getContacts()
{
   const res = await apiRequest("/contacts");
   const mappedData = res.data.map(mapContact)

   return {...res, data: mappedData}
}

export async function createContact(contact)
{
   const res = await apiRequest("/contacts",{
      method: "POST",
      body: JSON.stringify(contact)
   });

   const mappedData = mapContact(res.data);

   return {...res, data: mappedData};
}

export async function updateContact(id, contact)
{
   const res = await apiRequest(`/contacts/${id}`,{
      method: "PUT",
      body: JSON.stringify(contact)
   });

   const mappedData = mapContact(res.data)

   return {
      ...res,
      data: mappedData
   };
}

export function deleteContact(id)
{
   return apiRequest(`/contacts/${id}`,{
      method: "DELETE"
   });
}