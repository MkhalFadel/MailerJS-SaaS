function updateContactsFields(data)
{
   const fields = {};
   
   if(data.email?.trim()) fields.email = data.email;
   if(data.firstName?.trim()) fields.first_name = data.firstName;
   if(data.lastName?.trim()) fields.last_name = data.lastName;

   return fields;
}

module.exports = { updateContactsFields }
