import {
   formatNumber,
   formatPercentage
} from "../../../utils/utils";
import Icon from "../../icons/Icon";
import styles from "./dashboardStats.module.css";

function DashboardStats({ stats })
{
   const resourceStatistics = [
      {
         label: "Contacts",
         value: stats.totalContacts,
         icon: "contacts"
      },
      {
         label: "Campaigns",
         value: stats.totalCampaigns,
         icon: "campaign"
      },
      {
         label: "Templates",
         value: stats.totalTemplates,
         icon: "template"
      },
      {
         label: "SMTP Accounts",
         value: stats.totalSmtpAccounts,
         icon: "settings"
      }
   ];

   const deliveryStatistics = [
      {
         label: "Accepted",
         value: formatNumber(stats.acceptedEmails)
      },
      {
         label: "Failed",
         value: formatNumber(stats.failedEmails)
      },
      {
         label: "Success rate",
         value: formatPercentage(stats.successRate)
      }
   ];

   return (
      <section className={styles.metrics}>
         <div className={styles.resourceGrid}>
            {resourceStatistics.map((statistic) => (
               <article className={styles.statCard} key={statistic.label}>
                  <div className={styles.cardHeader}>
                     <span className={styles.icon}>
                        <Icon name={statistic.icon} size={18} />
                     </span>

                     <span className={styles.label}>
                        {statistic.label}
                     </span>
                  </div>

                  <strong>{formatNumber(statistic.value)}</strong>
               </article>
            ))}
         </div>

         <div className={styles.deliveryStrip}>
            <div>
               <span className={styles.deliveryLabel}>Delivery performance</span>
               <p>SMTP acceptance across all campaign sends.</p>
            </div>

            <div className={styles.deliveryMetrics}>
               {deliveryStatistics.map((statistic) => (
                  <div key={statistic.label}>
                     <span>{statistic.label}</span>
                     <strong>{statistic.value}</strong>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}

export default DashboardStats;
