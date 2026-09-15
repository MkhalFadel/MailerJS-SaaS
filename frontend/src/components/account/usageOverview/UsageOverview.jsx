import styles from "./usageOverview.module.css";

function UsageOverview({ stats, loading, error }) {
   const acceptedEmails = stats?.acceptedEmails ?? 0;
   const failedEmails = stats?.failedEmails ?? 0;
   const deliveryAttempts = acceptedEmails + failedEmails;
   const successRate = stats?.successRate ?? 0;
   const usage = [
      {
         label: "Email Attempts",
         value: deliveryAttempts.toLocaleString()
      },
      {
         label: "Campaigns",
         value: (stats?.totalCampaigns ?? 0).toLocaleString()
      },
      {
         label: "Templates",
         value: (stats?.totalTemplates ?? 0).toLocaleString()
      },
      {
         label: "Contacts",
         value: (stats?.totalContacts ?? 0).toLocaleString()
      }
   ];

   return (
      <section className={styles.container}>
         <div className={styles.header}>
            <h2>Usage</h2>

            <p>
               Your current usage across the platform.
            </p>
         </div>

         {loading && (
            <p className={styles.status} role="status">
               Loading account usage...
            </p>
         )}

         {error && (
            <p className={styles.error} role="alert">
               {error}
            </p>
         )}

         {!loading && !error && (
            <div className={styles.content}>
               <div className={styles.grid}>
                  {usage.map((item) => (
                     <div className={styles.item} key={item.label}>
                        <span>{item.label}</span>

                        <strong>{item.value}</strong>
                     </div>
                  ))}
               </div>

               <div className={styles.emailUsage}>
                  <div className={styles.usageHeader}>
                     <span>Delivery Results</span>

                     <strong>
                        {acceptedEmails.toLocaleString()} accepted · {failedEmails.toLocaleString()} failed
                     </strong>
                  </div>

                  <div className={styles.progressTrack}>
                     <div
                        className={styles.progressBar}
                        style={{
                           width: `${Math.min(Math.max(successRate, 0), 100)}%`
                        }}
                     />
                  </div>

                  <p>
                     {deliveryAttempts === 0
                        ? "No delivery attempts yet."
                        : `${successRate}% of delivery attempts were accepted by your SMTP provider.`}
                  </p>
               </div>
            </div>
         )}
      </section>
   );
}

export default UsageOverview;
