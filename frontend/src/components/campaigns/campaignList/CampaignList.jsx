import { useMemo, useState } from "react";
import styles from "./campaignList.module.css";
import { formatTemplateDate } from "../../../utils/utils";

function CampaignList({ campaigns, onCreate, onView }) {
   const [search, setSearch] = useState("");

   const filteredCampaigns = useMemo(() => {
      return campaigns.filter((campaign) => {
         const matchesSearch =
         campaign.name.toLowerCase().includes(search.toLowerCase()) ||
         campaign.subject.toLowerCase().includes(search.toLowerCase());

         return matchesSearch;
      });
   }, [campaigns, search]);

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
                           <th>Accepted</th>
                           <th>Created</th>
                           <th>Actions</th>
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

                              <td>{campaign.recipients}</td>

                              <td>{campaign.accepted}</td>

                              <td>{formatTemplateDate(campaign.createdAt)}</td>

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
