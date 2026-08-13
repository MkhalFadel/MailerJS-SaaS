import styles from "./campaignDetails.module.css";

const recipients = [
   {
      email: "john@example.com",
      status: "sent"
   },
   {
      email: "jane@example.com",
      status: "sent"
   },
   {
      email: "alex@example.com",
      status: "failed"
   },
   {
      email: "sarah@example.com",
      status: "sent"
   }
];

function CampaignDetails({ campaign, onBack }) {
   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <button
                  className={styles.backButton}
                  onClick={onBack}
               >
                  ← Back to Campaigns
               </button>

               <div className={styles.titleRow}>
                  <h1>{campaign.name}</h1>

                  <span
                     className={`${styles.status} ${
                        styles[campaign.status]
                     }`}
                  >
                     {campaign.status}
                  </span>
               </div>

               <p>{campaign.subject}</p>
            </div>
         </div>

         <div className={styles.statistics}>
            <div className={styles.statCard}>
               <span>Recipients</span>
               <strong>{campaign.recipients.toLocaleString()}</strong>
            </div>

            <div className={styles.statCard}>
               <span>Sent</span>
               <strong>{campaign.sent.toLocaleString()}</strong>
            </div>

            <div className={styles.statCard}>
               <span>Failed</span>
               <strong>{campaign.failed.toLocaleString()}</strong>
            </div>

            <div className={styles.statCard}>
               <span>Open Rate</span>
               <strong>{campaign.openRate}</strong>
            </div>

            <div className={styles.statCard}>
               <span>Click Rate</span>
               <strong>{campaign.clickRate}</strong>
            </div>
         </div>

         <div className={styles.card}>
            <div className={styles.cardHeader}>
               <div>
                  <h2>Recipients</h2>
                  <p>Delivery status for each recipient.</p>
               </div>
            </div>

            <div className={styles.tableWrapper}>
               <table>
                  <thead>
                     <tr>
                        <th>Email</th>
                        <th>Status</th>
                     </tr>
                  </thead>

                  <tbody>
                     {recipients.map((recipient) => (
                        <tr key={recipient.email}>
                           <td>{recipient.email}</td>

                           <td>
                              <span
                                 className={`${styles.recipientStatus} ${
                                    recipient.status === "sent"
                                       ? styles.sent
                                       : styles.failed
                                 }`}
                              >
                                 {recipient.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}

export default CampaignDetails;