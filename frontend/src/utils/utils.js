export function formatTemplateDate(date)
{
   return new Date(date).toLocaleDateString("en-US",{
      month: "short",
      day: "numeric",
      year: "numeric"
   });
}

export function formatNumber(value)
{
   return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

export function formatPercentage(value)
{
   const percentage = Number(value) || 0;

   return `${Number.isInteger(percentage) ? percentage : percentage.toFixed(1)}%`;
}
