import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import styles from "./dashboard.module.css";

const statistics = [
   {
      label: "Emails Sent",
      value: "12,450",
      change: "+12.5%",
      positive: true,
   },
   {
      label: "Delivered",
      value: "12,120",
      change: "+8.2%",
      positive: true,
   },
   {
      label: "Failed",
      value: "330",
      change: "-3.1%",
      positive: true,
   },
   {
      label: "Open Rate",
      value: "74.2%",
      change: "+5.4%",
      positive: true,
   },
];

const campaigns = [
   {
      name: "Summer Newsletter",
      recipients: "1,240",
      status: "Completed",
      date: "Aug 10, 2026",
   },
   {
      name: "Product Update",
      recipients: "320",
      status: "Completed",
      date: "Aug 8, 2026",
   },
   {
      name: "Job Applications",
      recipients: "42",
      status: "Draft",
      date: "Aug 7, 2026",
   },
];

function Dashboard() {
   return (
      <DashboardLayout>
         <div className={styles.header}>
         <div>
            <h1>Dashboard</h1>
            <p>Here's what's happening with your emails.</p>
         </div>

         <button className={styles.primaryButton}>
            + Create Campaign
         </button>
         </div>

         <section className={styles.statistics}>
         {statistics.map((stat) => (
            <div className={styles.statCard} key={stat.label}>
               <span className={styles.statLabel}>{stat.label}</span>

               <div className={styles.statValueRow}>
               <span className={styles.statValue}>{stat.value}</span>

               <span
                  className={`${styles.change} ${
                     stat.positive ? styles.positive : styles.negative
                  }`}
               >
                  {stat.change}
               </span>
               </div>

               <span className={styles.statDescription}>
               Compared with last month
               </span>
            </div>
         ))}
         </section>

         <section className={styles.contentGrid}>
         <div className={styles.card}>
            <div className={styles.cardHeader}>
               <div>
               <h2>Recent Campaigns</h2>
               <p>Your latest email campaigns.</p>
               </div>

               <button className={styles.secondaryButton}>
               View all
               </button>
            </div>

            <div className={styles.tableWrapper}>
               <table>
               <thead>
                  <tr>
                     <th>Campaign</th>
                     <th>Recipients</th>
                     <th>Status</th>
                     <th>Date</th>
                  </tr>
               </thead>

               <tbody>
                  {campaigns.map((campaign) => (
                     <tr key={campaign.name}>
                     <td className={styles.campaignName}>
                        {campaign.name}
                     </td>

                     <td>{campaign.recipients}</td>

                     <td>
                        <span
                           className={`${styles.status} ${
                           campaign.status === "Completed"
                              ? styles.completed
                              : styles.draft
                           }`}
                        >
                           {campaign.status}
                        </span>
                     </td>

                     <td>{campaign.date}</td>
                     </tr>
                  ))}
               </tbody>
               </table>
            </div>
         </div>

         <div className={styles.card}>
            <div className={styles.cardHeader}>
               <div>
               <h2>Quick Actions</h2>
               <p>Common tasks.</p>
               </div>
            </div>

            <div className={styles.actions}>
               <button className={styles.action}>
               <span>✉</span>
               <div>
                  <strong>Create Campaign</strong>
                  <small>Send a new email campaign</small>
               </div>
               </button>

               <button className={styles.action}>
               <span>▤</span>
               <div>
                  <strong>Create Template</strong>
                  <small>Build a reusable email</small>
               </div>
               </button>

               <button className={styles.action}>
               <span>♙</span>
               <div>
                  <strong>Add Contacts</strong>
                  <small>Add recipients to your list</small>
               </div>
               </button>
            </div>
         </div>
         </section>
      </DashboardLayout>
   );
}

export default Dashboard;