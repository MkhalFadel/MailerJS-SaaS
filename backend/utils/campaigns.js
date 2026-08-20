function updateCampaignFields(data)
{
   const fields = {};

   if(data.name?.trim())
      fields.name = data.name.trim();

   if(data.subject?.trim())
      fields.subject = data.subject.trim();

   if(data.templateId?.trim())
      fields.template_id = data.templateId.trim();

   if(data.smtpAccountId?.trim())
      fields.smtp_account_id = data.smtpAccountId.trim();

   return fields;
}

module.exports = { updateCampaignFields };