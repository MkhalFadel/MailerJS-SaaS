import {
   formatNumber,
   formatPercentage
} from "../../../utils/utils";
import styles from "./dashboardOverview.module.css";

function DashboardOverview({ stats })
{
   const resources = [
      {
         label: "Contacts",
         value: stats.totalContacts
      },
      {
         label: "Templates",
         value: stats.totalTemplates
      },
      {
         label: "SMTP Accounts",
         value: stats.totalSmtpAccounts
      }
   ];

   return (
      <div className={styles.overview}>
         <section className={styles.card}>
            <div className={styles.header}>
               <h2>Delivery Overview</h2>

               <p>
                  SMTP acceptance across all campaign delivery attempts.
               </p>
            </div>

            <div className={styles.deliveryMetrics}>
               <div>
                  <span>Accepted Emails</span>
                  <strong>{formatNumber(stats.acceptedEmails)}</strong>
               </div>

               <div>
                  <span>Failed Emails</span>
                  <strong>{formatNumber(stats.failedEmails)}</strong>
               </div>

               <div>
                  <span>Success Rate</span>
                  <strong>{formatPercentage(stats.successRate)}</strong>
               </div>
            </div>
         </section>

         <section className={styles.card}>
            <div className={styles.header}>
               <h2>Resource Overview</h2>

               <p>
                  Your configured MailerJS resources.
               </p>
            </div>

            <div className={styles.resources}>
               {resources.map((resource) => (
                  <div key={resource.label}>
                     <span>{resource.label}</span>
                     <strong>{formatNumber(resource.value)}</strong>
                  </div>
               ))}
            </div>
         </section>
      </div>
   );
}

export default DashboardOverview;
