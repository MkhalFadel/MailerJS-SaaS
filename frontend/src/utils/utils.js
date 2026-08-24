export function formatTemplateDate(date)
{
   return new Date(date).toLocaleDateString("en-US",{
      month: "short",
      day: "numeric",
      year: "numeric"
   });
}