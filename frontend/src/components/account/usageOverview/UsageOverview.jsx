import styles from "./usageOverview.module.css";

function UsageOverview() {
   const usage = {
      emails: 1248,
      campaigns: 24,
      templates: 8,
      contacts: 463
   };

   const emailLimit = 5000;
   const emailPercentage = Math.round(
      (usage.emails / emailLimit) * 100
   );

   return (
      <section className={styles.container}>
         <div className={styles.header}>
            <h2>Usage</h2>

            <p>
               Your current usage across the platform.
            </p>
         </div>

         <div className={styles.content}>
            <div className={styles.grid}>
               <div className={styles.item}>
                  <span>Emails Sent</span>

                  <strong>
                     {usage.emails.toLocaleString()}
                  </strong>
               </div>

               <div className={styles.item}>
                  <span>Campaigns</span>

                  <strong>
                     {usage.campaigns}
                  </strong>
               </div>

               <div className={styles.item}>
                  <span>Templates</span>

                  <strong>
                     {usage.templates}
                  </strong>
               </div>

               <div className={styles.item}>
                  <span>Contacts</span>

                  <strong>
                     {usage.contacts}
                  </strong>
               </div>
            </div>

            <div className={styles.emailUsage}>
               <div className={styles.usageHeader}>
                  <span>Monthly Emails</span>

                  <strong>
                     {usage.emails.toLocaleString()} / {emailLimit.toLocaleString()}
                  </strong>
               </div>

               <div className={styles.progressTrack}>
                  <div
                     className={styles.progressBar}
                     style={{
                        width: `${emailPercentage}%`
                     }}
                  />
               </div>

               <p>
                  {emailPercentage}% of your monthly email limit used.
               </p>
            </div>
         </div>
      </section>
   );
}

export default UsageOverview;