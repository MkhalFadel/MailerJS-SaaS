import { formatNumber } from "../../../utils/utils";
import Icon from "../../icons/Icon";
import styles from "./dashboardStats.module.css";

function DashboardStats({ stats })
{
   const statistics = [
      {
         label: "Total Contacts",
         value: stats.totalContacts,
         icon: "contacts"
      },
      {
         label: "Campaigns",
         value: stats.totalCampaigns,
         icon: "campaign"
      },
      {
         label: "Accepted Emails",
         value: stats.acceptedEmails,
         icon: "check"
      },
      {
         label: "Failed Emails",
         value: stats.failedEmails,
         icon: "alert"
      }
   ];

   return (
      <section className={styles.statistics}>
         {statistics.map((statistic) => (
            <div
               className={styles.statCard}
               key={statistic.label}
            >
               <div className={styles.cardHeader}>
                  <span className={styles.label}>
                     {statistic.label}
                  </span>

                  <span className={styles.icon}>
                     <Icon name={statistic.icon} size={18} />
                  </span>
               </div>

               <strong>
                  {formatNumber(statistic.value)}
               </strong>
            </div>
         ))}
      </section>
   );
}

export default DashboardStats;
