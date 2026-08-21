function renderTemplate(content, contact)
{
   return content
      .replaceAll(
         "{{first_name}}",
         contact.first_name || ""
      )
      .replaceAll(
         "{{last_name}}",
         contact.last_name || ""
      )
      .replaceAll(
         "{{email}}",
         contact.email || ""
      );
}

module.exports = { renderTemplate };