import { useMemo, useState } from "react";
import styles from "./campaignList.module.css";
import { formatTemplateDate } from "../../../utils/utils";
import EmptyState from "../../feedback/EmptyState";
import Icon from "../../icons/Icon";

function getCampaignWarning(campaign)
{
   const warnings = [];

   if(!campaign.templateId || !campaign.template)
      warnings.push("Template missing");

   if(campaign.recipients === 0)
      warnings.push("No recipients");

   return warnings.join(" · ");
}

function handleRowKeyDown(event, campaign, onView)
{
   if(event.key === "Enter" || event.key === " ")
   {
      event.preventDefault();
      onView(campaign);
   }
}

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
                        </tr>
                     </thead>

                     <tbody>
                        {filteredCampaigns.map((campaign) => {
                           const warning = getCampaignWarning(campaign);

                           return (
                              <tr
                                 key={campaign.id}
                                 aria-label={`View ${campaign.name}`}
                                 className={styles.clickableRow}
                                 onClick={() => onView(campaign)}
                                 onKeyDown={(event) => handleRowKeyDown(event, campaign, onView)}
                                 role="button"
                                 tabIndex="0"
                              >
                                 <td>
                                 <div className={styles.campaignDetails}>
                                    <strong>{campaign.name}</strong>
                                    <span>{campaign.subject}</span>

                                    {warning && (
                                       <span className={styles.configurationWarning}>
                                          {warning}
                                       </span>
                                    )}
                                 </div>
                                 </td>

                                 <td>{campaign.recipients}</td>

                                 <td>{campaign.accepted}</td>

                                 <td>{formatTemplateDate(campaign.createdAt)}</td>
                              </tr>
                           );
                        })}
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
