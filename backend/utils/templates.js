function updateTemplatesFields(data)
{
   const fields = {};
   
   if(data.name?.trim()) fields.name = data.name.trim();
   if(data.subject?.trim()) fields.subject = data.subject.trim();
   if(data.content?.trim()) fields.content = data.content;

   return fields;
}

module.exports = { updateTemplatesFields };