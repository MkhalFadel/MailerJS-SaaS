import { formatNumber } from "../../../utils/utils";
import styles from "./dashboardStats.module.css";

function DashboardStats({ stats })
{
   const statistics = [
      {
         label: "Total Contacts",
         value: stats.totalContacts
      },
      {
         label: "Campaigns",
         value: stats.totalCampaigns
      },
      {
         label: "Accepted Emails",
         value: stats.acceptedEmails
      },
      {
         label: "Failed Emails",
         value: stats.failedEmails
      }
   ];

   return (
      <section className={styles.statistics}>
         {statistics.map((statistic) => (
            <div
               className={styles.statCard}
               key={statistic.label}
            >
               <span className={styles.label}>
                  {statistic.label}
               </span>

               <strong>
                  {formatNumber(statistic.value)}
               </strong>
            </div>
         ))}
      </section>
   );
}

export default DashboardStats;
