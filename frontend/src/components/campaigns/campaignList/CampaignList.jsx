import { useMemo, useState } from "react";
import styles from "./campaignList.module.css";

function CampaignList({ campaigns, onCreate, onView }) {
   const [search, setSearch] = useState("");
   const [status, setStatus] = useState("all");

   const filteredCampaigns = useMemo(() => {
      return campaigns.filter((campaign) => {
         const matchesSearch =
            campaign.name.toLowerCase().includes(search.toLowerCase()) ||
            campaign.subject.toLowerCase().includes(search.toLowerCase());

         const matchesStatus =
            status === "all" || campaign.status === status;

         return matchesSearch && matchesStatus;
      });
   }, [campaigns, search, status]);

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <h1>Campaigns</h1>
               <p>Manage and monitor your email campaigns.</p>
            </div>

            <button
               className={styles.primaryButton}
               onClick={onCreate}
            >
               + Create Campaign
            </button>
         </div>

         <div className={styles.toolbar}>
            <div className={styles.searchWrapper}>
               <span className={styles.searchIcon}>⌕</span>

               <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
               />
            </div>

            <select
               value={status}
               onChange={(event) => setStatus(event.target.value)}
               className={styles.filter}
            >
               <option value="all">All Statuses</option>
               <option value="completed">Completed</option>
               <option value="scheduled">Scheduled</option>
               <option value="draft">Draft</option>
            </select>
         </div>

         <div className={styles.card}>
            {filteredCampaigns.length === 0 ? (
               <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>✉</div>
                  <h2>No campaigns found</h2>
                  <p>
                     Try changing your search or create a new campaign.
                  </p>

                  <button
                     className={styles.primaryButton}
                     onClick={onCreate}
                  >
                     Create Campaign
                  </button>
               </div>
            ) : (
               <div className={styles.tableWrapper}>
                  <table>
                     <thead>
                        <tr>
                           <th>Campaign</th>
                           <th>Recipients</th>
                           <th>Status</th>
                           <th>Sent</th>
                           <th>Created</th>
                           <th></th>
                        </tr>
                     </thead>

                     <tbody>
                        {filteredCampaigns.map((campaign) => (
                           <tr key={campaign.id}>
                              <td>
                                 <button
                                    className={styles.campaignButton}
                                    onClick={() => onView(campaign)}
                                 >
                                    <strong>{campaign.name}</strong>
                                    <span>{campaign.subject}</span>
                                 </button>
                              </td>

                              <td>{campaign.recipients.toLocaleString()}</td>

                              <td>
                                 <span
                                    className={`${styles.status} ${
                                       styles[campaign.status]
                                    }`}
                                 >
                                    {campaign.status}
                                 </span>
                              </td>

                              <td>{campaign.sent.toLocaleString()}</td>

                              <td>{campaign.createdAt}</td>

                              <td>
                                 <button
                                    className={styles.moreButton}
                                    onClick={() => onView(campaign)}
                                 >
                                    ⋮
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </div>

         <div className={styles.footer}>
            Showing {filteredCampaigns.length} of {campaigns.length} campaigns
         </div>
      </div>
   );
}

export default CampaignList;