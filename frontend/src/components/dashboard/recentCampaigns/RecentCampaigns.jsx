import {
   formatNumber,
   formatTemplateDate
} from "../../../utils/utils";
import styles from "./recentCampaigns.module.css";

function getSendStatus(latestSend)
{
   if(!latestSend)
   {
      return {
         label: "Not sent",
         className: styles.notSent
      };
   }

   const statuses = {
      QUEUED: {
         label: "Queued",
         className: styles.queued
      },
      PROCESSING: {
         label: "Sending",
         className: styles.processing
      },
      CANCEL_REQUESTED: {
         label: "Cancelling",
         className: styles.cancelling
      },
      CANCELLED: {
         label: "Cancelled",
         className: styles.cancelled
      },
      COMPLETED: {
         label: "Completed",
         className: styles.completed
      },
      COMPLETED_WITH_ERRORS: {
         label: "Completed with errors",
         className: styles.completedWithErrors
      },
      FAILED: {
         label: "Failed",
         className: styles.failed
      }
   };

   return statuses[latestSend.status] || {
      label: "Not sent",
      className: styles.notSent
   };
}

function getCampaignWarning(campaign)
{
   const warnings = [];

   if(!campaign.templateId)
      warnings.push("Template missing");

   if(campaign.recipientCount === 0)
      warnings.push("No recipients");

   return warnings.join(" · ");
}

function RecentCampaigns({ campaigns })
{
   return (
      <section className={styles.card}>
         <div className={styles.header}>
            <div>
               <h2>Recent Campaigns</h2>

               <p>
                  Your five most recently created campaigns.
               </p>
            </div>
         </div>

         {campaigns.length === 0 ? (
            <div className={styles.emptyState}>
               <h3>No campaigns yet</h3>

               <p>
                  Create a campaign to start sending emails.
               </p>
            </div>
         ) : (
            <div className={styles.tableWrapper}>
               <table className={styles.table}>
                  <thead>
                     <tr>
                        <th>Campaign</th>
                        <th>Recipients</th>
                        <th>Latest Send</th>
                        <th>Accepted</th>
                        <th>Failed</th>
                        <th>Created</th>
                     </tr>
                  </thead>

                  <tbody>
                     {campaigns.map((campaign) => {
                        const sendStatus = getSendStatus(campaign.latestSend);
                        const warning = getCampaignWarning(campaign);

                        return (
                           <tr key={campaign.id}>
                              <td>
                                 <div className={styles.campaignDetails}>
                                    <strong>{campaign.name}</strong>
                                    <span>{campaign.subject}</span>

                                    {warning && (
                                       <span className={styles.configurationWarning}>
                                          {warning}
                                       </span>
                                    )}
                                 </div>
                              </td>

                              <td>{formatNumber(campaign.recipientCount)}</td>

                              <td>
                                 <span
                                    className={
                                       styles.status + " " +
                                       sendStatus.className
                                    }
                                 >
                                    {sendStatus.label}
                                 </span>
                              </td>

                              <td>
                                 {formatNumber(
                                    campaign.latestSend?.acceptedCount
                                 )}
                              </td>

                              <td>
                                 {formatNumber(
                                    campaign.latestSend?.failedCount
                                 )}
                              </td>

                              <td>
                                 {formatTemplateDate(campaign.createdAt)}
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         )}
      </section>
   );
}

export default RecentCampaigns;
