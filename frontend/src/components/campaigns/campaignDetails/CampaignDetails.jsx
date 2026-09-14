import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./campaignDetails.module.css";
import {
   addCampaignRecipients,
   deleteCampaignRecipient,
   getCampaignDeliveries,
   getCampaignRecipients,
   sendCampaign
} from "../../../api/campaigns";
import { getContacts } from "../../../api/contacts";
import ContactSelector from "../contactSelector/ContactSelector";

function CampaignDetails({ campaign, onBack })
{
   const [recipients, setRecipients] = useState([]);
   const [deliveries, setDeliveries] = useState([]);
   const [contacts, setContacts] = useState([]);
   const [selectedContacts, setSelectedContacts] = useState([]);
   const [showContactSelector, setShowContactSelector] = useState(false);
   const [loadingRecipients, setLoadingRecipients] = useState(true);
   const [loadingDeliveries, setLoadingDeliveries] = useState(true);
   const [loadingContacts, setLoadingContacts] = useState(false);
   const [addingRecipients, setAddingRecipients] = useState(false);
   const [removingRecipientId, setRemovingRecipientId] = useState(null);
   const [sending, setSending] = useState(false);
   const [recipientsError, setRecipientsError] = useState(null);
   const [deliveriesError, setDeliveriesError] = useState(null);
   const [sendError, setSendError] = useState(null);
   const [sendSummary, setSendSummary] = useState(null);

   const loadRecipients = useCallback(async function loadRecipients()
   {
      setLoadingRecipients(true);
      setRecipientsError(null);

      try {
         const response = await getCampaignRecipients(campaign.id);

         setRecipients(response.data);
      } catch(error) {
         console.error("Failed to fetch campaign recipients:", error);

         setRecipientsError(
            error.message ||
            "Unable to load campaign recipients."
         );
      } finally {
         setLoadingRecipients(false);
      }
   },[campaign.id]);

   const loadDeliveries = useCallback(async function loadDeliveries()
   {
      setLoadingDeliveries(true);
      setDeliveriesError(null);

      try {
         const response = await getCampaignDeliveries(campaign.id);

         setDeliveries(response.data);
      } catch(error) {
         console.error("Failed to fetch campaign deliveries:", error);

         setDeliveriesError(
            error.message ||
            "Unable to load delivery history."
         );
      } finally {
         setLoadingDeliveries(false);
      }
   },[campaign.id]);

   useEffect(() => {
      async function loadCampaignDetails()
      {
         await Promise.all([
            loadRecipients(),
            loadDeliveries()
         ]);
      }

      loadCampaignDetails();
   },[loadDeliveries,loadRecipients]);

   const statistics = useMemo(() => {
      const accepted = deliveries.filter(
         delivery => delivery.status === "accepted"
      ).length;

      const failed = deliveries.filter(
         delivery => delivery.status === "failed"
      ).length;

      return {
         recipients: recipients.length,
         accepted,
         failed
      };
   },[recipients,deliveries]);

   function handleCloseContactSelector()
   {
      setSelectedContacts([]);
      setShowContactSelector(false);
   }

   async function handleChooseContacts()
   {
      setLoadingContacts(true);
      setRecipientsError(null);

      try {
         const response = await getContacts();

         setContacts(response.data);
         setSelectedContacts([]);
         setShowContactSelector(true);
      } catch(error) {
         console.error("Failed to fetch contacts:", error);

         setRecipientsError(
            error.message ||
            "Unable to load contacts."
         );
      } finally {
         setLoadingContacts(false);
      }
   }

   async function handleAddRecipients()
   {
      if(addingRecipients)
         return;

      const recipientIds = new Set(
         recipients.map(recipient => recipient.contactId)
      );

      const contactsToAdd = selectedContacts.filter(
         contact => !recipientIds.has(contact.id)
      );

      if(contactsToAdd.length === 0)
      {
         handleCloseContactSelector();
         return;
      }

      setAddingRecipients(true);
      setRecipientsError(null);

      try {
         const contactIds = contactsToAdd.map(contact => contact.id);

         await addCampaignRecipients(campaign.id, contactIds);

         setRecipients(current => {
            const existingIds = new Set(
               current.map(recipient => recipient.contactId)
            );

            const newRecipients = contactsToAdd
               .filter(contact => !existingIds.has(contact.id))
               .map(contact => ({
                  id: contact.id,
                  campaignId: campaign.id,
                  contactId: contact.id,
                  contact
               }));

            return [
               ...current,
               ...newRecipients
            ];
         });

         handleCloseContactSelector();
      } catch(error) {
         console.error("Failed to add campaign recipients:", error);

         setRecipientsError(
            error.message ||
            "Unable to add campaign recipients."
         );
      } finally {
         setAddingRecipients(false);
      }
   }

   async function handleRemoveRecipient(contactId)
   {
      setRemovingRecipientId(contactId);
      setRecipientsError(null);

      try {
         await deleteCampaignRecipient(campaign.id, contactId);

         setRecipients(current =>
            current.filter(
               recipient => recipient.contactId !== contactId
            )
         );
      } catch(error) {
         console.error("Failed to remove campaign recipient:", error);

         setRecipientsError(
            error.message ||
            "Unable to remove campaign recipient."
         );
      } finally {
         setRemovingRecipientId(null);
      }
   }

   async function handleSendCampaign()
   {
      setSending(true);
      setSendError(null);
      setSendSummary(null);

      try {
         const response = await sendCampaign(campaign.id);

         setSendSummary(response.data);
         await loadDeliveries();
      } catch(error) {
         console.error("Failed to send campaign:", error);

         setSendError(
            error.message ||
            "Unable to send campaign."
         );
      } finally {
         setSending(false);
      }
   }

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <button
                  type="button"
                  className={styles.backButton}
                  onClick={onBack}
               >
                  Back to Campaigns
               </button>

               <div className={styles.titleRow}>
                  <h1>
                     {campaign.name}
                  </h1>
               </div>

               <p>
                  {campaign.subject}
               </p>
            </div>

            <div className={styles.headerActions}>
               <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleSendCampaign}
                  disabled={sending || recipients.length === 0}
               >
                  {sending
                     ? "Sending..."
                     : "Send Campaign"}
               </button>
            </div>
         </div>

         {sendError && (
            <div className={styles.error}>
               {sendError}
            </div>
         )}

         {sendSummary && (
            <div className={styles.sendSummary}>
               <div>
                  <h2>Campaign Sending Complete</h2>

                  <p>
                     SMTP acceptance confirms server submission, not final mailbox delivery.
                  </p>
               </div>

               <div className={styles.summaryStatistics}>
                  <span>Total: {sendSummary.total}</span>
                  <span>Successful: {sendSummary.successful}</span>
                  <span>Failed: {sendSummary.failed}</span>
               </div>

               {sendSummary.failures?.length > 0 && (
                  <ul className={styles.failureList}>
                     {sendSummary.failures.map((failure) => (
                        <li key={failure.contactId}>
                           {failure.email}: {failure.error}
                        </li>
                     ))}
                  </ul>
               )}
            </div>
         )}

         <div className={styles.statistics}>
            <div className={styles.statCard}>
               <span>Recipients</span>

               <strong>
                  {statistics.recipients}
               </strong>
            </div>

            <div className={styles.statCard}>
               <span>Accepted</span>

               <strong>
                  {statistics.accepted}
               </strong>
            </div>

            <div className={styles.statCard}>
               <span>Failed</span>

               <strong>
                  {statistics.failed}
               </strong>
            </div>
         </div>

         <div className={styles.card}>
            <div className={styles.cardHeader}>
               <div>
                  <h2>Recipients</h2>

                  <p>
                     Manage the contacts that will receive this campaign.
                  </p>
               </div>

               <button
                  type="button"
                  className={styles.addContactButton}
                  onClick={handleChooseContacts}
                  disabled={loadingContacts || addingRecipients}
               >
                  {loadingContacts
                     ? "Loading Contacts..."
                     : "Add Contacts"}
               </button>
            </div>

            {recipientsError && (
               <div className={styles.cardError}>
                  {recipientsError}
               </div>
            )}

            {loadingRecipients && (
               <div className={styles.emptyState}>
                  Loading recipients...
               </div>
            )}

            {!loadingRecipients && !recipientsError && (
               <>
                  {recipients.length === 0 ? (
                     <div className={styles.emptyState}>
                        No contacts have been added to this campaign yet.
                     </div>
                  ) : (
                     <div className={styles.tableWrapper}>
                        <table>
                           <thead>
                              <tr>
                                 <th>First Name</th>
                                 <th>Last Name</th>
                                 <th>Email</th>
                                 <th>Actions</th>
                              </tr>
                           </thead>

                           <tbody>
                              {recipients.map((recipient) => (
                                 <tr key={recipient.contactId}>
                                    <td>
                                       {recipient.contact?.firstName || "-"}
                                    </td>

                                    <td>
                                       {recipient.contact?.lastName || "-"}
                                    </td>

                                    <td>
                                       {recipient.contact?.email || "-"}
                                    </td>

                                    <td>
                                       <button
                                          type="button"
                                          className={styles.removeButton}
                                          onClick={() =>
                                             handleRemoveRecipient(
                                                recipient.contactId
                                             )
                                          }
                                          disabled={
                                             removingRecipientId ===
                                             recipient.contactId
                                          }
                                       >
                                          {removingRecipientId ===
                                          recipient.contactId
                                             ? "Removing..."
                                             : "Remove"}
                                       </button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}
               </>
            )}
         </div>

         <div className={styles.card}>
            <div className={styles.cardHeader}>
               <div>
                  <h2>Delivery History</h2>

                  <p>
                     SMTP submission attempts recorded for this campaign.
                  </p>
               </div>
            </div>

            {loadingDeliveries && (
               <div className={styles.emptyState}>
                  Loading delivery history...
               </div>
            )}

            {!loadingDeliveries && deliveriesError && (
               <div className={styles.cardError}>
                  {deliveriesError}
               </div>
            )}

            {!loadingDeliveries && !deliveriesError && (
               <>
                  {deliveries.length === 0 ? (
                     <div className={styles.emptyState}>
                        No delivery attempts have been recorded yet.
                     </div>
                  ) : (
                     <div className={styles.tableWrapper}>
                        <table>
                           <thead>
                              <tr>
                                 <th>Email</th>
                                 <th>Status</th>
                                 <th>Sent At</th>
                                 <th>Error</th>
                              </tr>
                           </thead>

                           <tbody>
                              {deliveries.map((delivery) => (
                                 <tr key={delivery.id}>
                                    <td>
                                       {delivery.contact?.email || "-"}
                                    </td>

                                    <td>
                                       <span
                                          className={
                                             styles.recipientStatus + " " +
                                             (delivery.status === "accepted"
                                                ? styles.accepted
                                                : styles.failed)
                                          }
                                       >
                                          {delivery.status}
                                       </span>
                                    </td>

                                    <td>
                                       {delivery.sentAt
                                          ? new Date(
                                             delivery.sentAt
                                          ).toLocaleString()
                                          : "-"}
                                    </td>

                                    <td>
                                       {delivery.errorMessage || "-"}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}
               </>
            )}
         </div>

         {showContactSelector && (
            <ContactSelector
               contacts={contacts}
               selectedContacts={selectedContacts}
               setSelectedContacts={setSelectedContacts}
               onClose={handleCloseContactSelector}
               onConfirm={handleAddRecipients}
               confirmDisabled={addingRecipients}
               excludedContactIds={
                  recipients.map(recipient => recipient.contactId)
               }
            />
         )}
      </div>
   );
}

export default CampaignDetails;
