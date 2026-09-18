import { useMemo, useState } from "react";
import styles from "./campaignList.module.css";
import { formatTemplateDate } from "../../../utils/utils";
import EmptyState from "../../feedback/EmptyState";
import Icon from "../../icons/Icon";

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
               type="button"
               >
               <Icon name="plus" size={16} />
               Create Campaign
            </button>
         </div>

         <div className={styles.toolbar}>
            <div className={styles.searchWrapper}>
               <Icon className={styles.searchIcon} name="search" size={18} />

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
               <EmptyState
                  actionLabel="Create Campaign"
                  description="Try changing your search or create a new campaign."
                  icon="campaign"
                  onAction={onCreate}
                  title="No campaigns found"
               />
            ) : (
               <div className={styles.tableWrapper}>
                  <table className={styles.table}>
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
                                    aria-label={`View ${campaign.name}`}
                                    type="button"
                                 >
                                    <Icon name="more" size={18} />
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
