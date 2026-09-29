import {
   formatNumber,
   formatPercentage
} from "../../../utils/utils";
import styles from "./dashboardOverview.module.css";
import Icon from "../../icons/Icon";

function DashboardOverview({ stats })
{
   const readiness = [
      {
         label: "Templates",
         value: stats.totalTemplates,
         description: "Reusable campaign content"
      },
      {
         label: "SMTP Accounts",
         value: stats.totalSmtpAccounts,
         description: "Configured sending accounts"
      }
   ];

   return (
      <div className={styles.overview}>
         <section className={styles.deliveryPanel}>
            <span className={styles.panelIcon}>
               <Icon name="send" size={17} />
            </span>

            <div>
               <h2>Delivery overview</h2>
               <p>SMTP acceptance across all campaign delivery attempts.</p>
            </div>

            <div className={styles.deliveryMetrics}>
               <div>
                  <span>Accepted</span>
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

         <section className={styles.readinessPanel}>
            <div className={styles.readinessHeader}>
               <div>
                  <h2>Campaign readiness</h2>
                  <p>Resources available for your next send.</p>
               </div>

               <Icon name="settings" size={18} />
            </div>

            <div className={styles.readinessList}>
               {readiness.map((resource) => (
                  <div key={resource.label}>
                     <div>
                        <strong>{resource.label}</strong>
                        <span>{resource.description}</span>
                     </div>

                     <span className={resource.value > 0
                        ? styles.ready
                        : styles.needsSetup}
                     >
                        {resource.value > 0
                           ? `${formatNumber(resource.value)} available`
                           : "Needs setup"}
                     </span>
                  </div>
               ))}
            </div>
         </section>
      </div>
   );
}

export default DashboardOverview;
