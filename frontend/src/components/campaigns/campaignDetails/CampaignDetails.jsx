import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./campaignDetails.module.css";
import {
   addCampaignRecipients,
   cancelCampaignSend,
   deleteCampaignRecipient,
   getCampaignSend,
   getCampaignSends,
   getCampaignDeliveries,
   getCampaignRecipients,
   sendCampaign
} from "../../../api/campaigns";
import { getContacts } from "../../../api/contacts";
import ContactSelector from "../contactSelector/ContactSelector";
import Icon from "../../icons/Icon";
import BackButton from "../../navigation/BackButton";
import ConfirmModal from "../../feedback/ConfirmModal";
import FeedbackState from "../../feedback/FeedbackState";
import useFeedbackScroll from "../../../hooks/useFeedbackScroll";

function isActiveCampaignSend(campaignSend)
{
   return [
      "QUEUED",
      "PROCESSING",
      "CANCEL_REQUESTED"
   ].includes(campaignSend?.status);
}

function isTerminalCampaignSend(campaignSend)
{
   return [
      "COMPLETED",
      "COMPLETED_WITH_ERRORS",
      "FAILED",
      "CANCELLED"
   ].includes(campaignSend?.status);
}

function getCampaignSendTitle(campaignSend)
{
   if(campaignSend.status === "QUEUED")
      return "Campaign Queued";

   if(campaignSend.status === "PROCESSING")
      return "Sending Campaign";

   if(campaignSend.status === "CANCEL_REQUESTED")
      return "Stopping Campaign";

   if(campaignSend.status === "CANCELLED")
      return "Campaign Cancelled";

   if(campaignSend.status === "COMPLETED")
      return "Campaign Completed";

   if(campaignSend.status === "COMPLETED_WITH_ERRORS")
      return "Campaign Completed With Errors";

   return "Campaign Send Failed";
}

function getDeliveryStatus(delivery)
{
   if(
      delivery.status === "pending" &&
      delivery.campaignSendStatus === "CANCELLED"
   )
   {
      return {
         className: styles.notSent,
         label: "Not sent"
      };
   }

   return {
      className: delivery.status === "accepted"
         ? styles.accepted
         : delivery.status === "failed"
            ? styles.failed
            : styles.pending,
      label: delivery.status
   };
}

function CampaignDetails({ campaign, onBack, onEdit })
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
   const [loadingSend, setLoadingSend] = useState(true);
   const [recipientsError, setRecipientsError] = useState(null);
   const [deliveriesError, setDeliveriesError] = useState(null);
   const [sendError, setSendError] = useState(null);
   const [campaignSend, setCampaignSend] = useState(null);
   const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
   const [cancelling, setCancelling] = useState(false);
   const [cancelError, setCancelError] = useState(null);
   const { feedbackRef, requestFeedbackScroll } = useFeedbackScroll(
      sendError || recipientsError
   );
   const {
      feedbackRef: cancelFeedbackRef,
      requestFeedbackScroll: requestCancelFeedbackScroll
   } = useFeedbackScroll(cancelError);

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

   const campaignSendId = campaignSend?.id;
   const campaignSendStatus = campaignSend?.status;

   const loadCampaignSends = useCallback(async function loadCampaignSends()
   {
      setLoadingSend(true);

      try {
         const response = await getCampaignSends(campaign.id);
         const activeSend = response.data.find(isActiveCampaignSend);

         setCampaignSend(activeSend || response.data[0] || null);
      } catch(error) {
         console.error("Failed to fetch campaign sends:", error);

         setSendError(
            error.message ||
            "Unable to load campaign send status."
         );
      } finally {
         setLoadingSend(false);
      }
   },[campaign.id]);

   useEffect(() => {
      async function loadCampaignDetails()
      {
         await Promise.all([
            loadRecipients(),
            loadDeliveries(),
            loadCampaignSends()
         ]);
      }

      loadCampaignDetails();
   },[loadCampaignSends,loadDeliveries,loadRecipients]);

   useEffect(() => {
      if(![
         "QUEUED",
         "PROCESSING",
         "CANCEL_REQUESTED"
      ].includes(campaignSendStatus))
         return;

      let cancelled = false;
      let polling = false;

      async function pollCampaignSend()
      {
         if(polling)
            return;

         polling = true;

         try {
            const response = await getCampaignSend(
               campaign.id,
               campaignSendId
            );

            if(cancelled)
               return;

            setCampaignSend(response.data);

            if(isTerminalCampaignSend(response.data))
               await loadDeliveries();
         } catch(error) {
            if(!cancelled)
            {
               console.error("Failed to poll campaign send:", error);

               setSendError(
                  error.message ||
                  "Unable to refresh campaign send status."
               );
            }
         } finally {
            polling = false;
         }
      }

      pollCampaignSend();

      const interval = setInterval(pollCampaignSend, 2500);

      return () => {
         cancelled = true;
         clearInterval(interval);
      };
   },[
      campaign.id,
      campaignSendId,
      campaignSendStatus,
      loadDeliveries
   ]);

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

         requestFeedbackScroll();
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

         requestFeedbackScroll();
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

         requestFeedbackScroll();
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
      if(isActiveCampaignSend(campaignSend))
         return;

      setSending(true);
      setSendError(null);

      try {
         const response = await sendCampaign(campaign.id);

         setCampaignSend(response.data);
      } catch(error) {
         console.error("Failed to send campaign:", error);

         if(error.status === 409)
         {
            await loadCampaignSends();
            return;
         }

         requestFeedbackScroll();
         setSendError(
            error.message ||
            "Unable to send campaign."
         );
      } finally {
         setSending(false);
      }
   }

   function handleCloseCancelConfirmation()
   {
      if(cancelling)
         return;

      setCancelError(null);
      setShowCancelConfirmation(false);
   }

   async function handleCancelCampaignSend()
   {
      if(!campaignSend || cancelling)
         return;

      setCancelling(true);
      setCancelError(null);

      try {
         const response = await cancelCampaignSend(
            campaign.id,
            campaignSend.id
         );

         setCampaignSend(response.data);
         setShowCancelConfirmation(false);

         if(isTerminalCampaignSend(response.data))
            await loadDeliveries();
      } catch(error) {
         console.error("Failed to cancel campaign send:", error);

         requestCancelFeedbackScroll();
         setCancelError(
            error.message ||
            "Unable to cancel campaign sending."
         );
      } finally {
         setCancelling(false);
      }
   }

   const processedRecipients = campaignSend
      ? campaignSend.acceptedCount + campaignSend.failedCount
      : 0;
   const notSentRecipients = campaignSend
      ? Math.max(
         0,
         campaignSend.totalRecipients - processedRecipients
      )
      : 0;

   const sendingIsActive = isActiveCampaignSend(campaignSend);
   const canCancelCampaignSend = ["QUEUED", "PROCESSING"].includes(
      campaignSend?.status
   );

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <BackButton onClick={onBack}>
                  Back to Campaigns
               </BackButton>

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
                  className={styles.secondaryButton}
                  onClick={onEdit}
                  type="button"
               >
                  <Icon name="edit" size={16} />
                  Edit Campaign
               </button>

               <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleSendCampaign}
                  disabled={
                     sending ||
                     loadingSend ||
                     sendingIsActive
                  }
               >
                  <Icon name="send" size={16} />
                  {sending
                     ? "Queueing..."
                     : campaignSend?.status === "QUEUED"
                        ? "Queued"
                        : campaignSend?.status === "PROCESSING"
                           ? "Sending..."
                           : campaignSend?.status === "CANCEL_REQUESTED"
                              ? "Stopping..."
                     : "Send Campaign"}
               </button>

               {canCancelCampaignSend && (
                  <button
                     className={styles.cancelSendButton}
                     disabled={cancelling}
                     onClick={() => {
                        setCancelError(null);
                        setShowCancelConfirmation(true);
                     }}
                     type="button"
                  >
                     <Icon name="close" size={16} />
                     {cancelling ? "Cancelling..." : "Cancel Send"}
                  </button>
               )}
            </div>
         </div>

         {!campaign.template && (
            <div className={styles.configurationWarning}>
               <Icon name="alert" size={17} />
               This campaign is missing its template. Edit the campaign and select another template before sending.
            </div>
         )}

         {!loadingRecipients && recipients.length === 0 && (
            <div className={styles.configurationWarning}>
               <Icon name="alert" size={17} />
               This campaign has no recipients. Add at least one contact before sending.
            </div>
         )}

         {sendError && (
            <FeedbackState feedbackRef={feedbackRef} type="error">
               {sendError}
            </FeedbackState>
         )}

         {campaignSend && (
            <div
               className={
                  styles.sendSummary + " " +
                  (campaignSend.status === "FAILED"
                     ? styles.sendFailed
                     : campaignSend.status === "COMPLETED_WITH_ERRORS"
                        ? styles.sendWithErrors
                        : campaignSend.status === "CANCELLED"
                           ? styles.sendCancelled
                        : sendingIsActive
                           ? styles.sendActive
                           : "")
               }
            >
               <div>
                  <h2>{getCampaignSendTitle(campaignSend)}</h2>

                  <p>
                     {campaignSend.status === "CANCEL_REQUESTED"
                        ? "Cancellation requested. MailerJS will stop before sending the next recipient."
                        : campaignSend.status === "CANCELLED"
                           ? `${processedRecipients} of ${campaignSend.totalRecipients} recipients processed. ${notSentRecipients} not sent.`
                           : sendingIsActive
                              ? `${processedRecipients} of ${campaignSend.totalRecipients} recipients processed.`
                              : "SMTP acceptance confirms server submission, not final mailbox delivery."}
                  </p>
               </div>

               <div className={styles.summaryStatistics}>
                  <span>Total: {campaignSend.totalRecipients}</span>
                  <span>Accepted: {campaignSend.acceptedCount}</span>
                  <span>Failed: {campaignSend.failedCount}</span>
                  {campaignSend.status === "CANCELLED" && (
                     <span>Not sent: {notSentRecipients}</span>
                  )}
               </div>

               {campaignSend.errorMessage && (
                  <p className={styles.sendErrorMessage}>
                     {campaignSend.errorMessage}
                  </p>
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
                  <Icon name="plus" size={16} />
                  {loadingContacts
                     ? "Loading Contacts..."
                     : "Add Contacts"}
               </button>
            </div>

            {recipientsError && (
               <FeedbackState feedbackRef={feedbackRef} type="error">
                  {recipientsError}
               </FeedbackState>
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
                                          <Icon name="trash" size={15} />
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
                                 <th>Send Run</th>
                                 <th>Status</th>
                                 <th>Sent At</th>
                                 <th>Error</th>
                              </tr>
                           </thead>

                           <tbody>
                              {deliveries.map((delivery) => {
                                 const deliveryStatus = getDeliveryStatus(delivery);

                                 return (
                                    <tr key={delivery.id}>
                                       <td>
                                          {delivery.contact?.email || "-"}
                                       </td>

                                       <td>
                                          {delivery.campaignSendCreatedAt
                                             ? new Date(
                                                delivery.campaignSendCreatedAt
                                             ).toLocaleString()
                                             : "Legacy"}
                                       </td>

                                       <td>
                                          <span
                                             className={
                                                styles.recipientStatus + " " +
                                                deliveryStatus.className
                                             }
                                          >
                                             {deliveryStatus.label}
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
                                 );
                              })}
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
               confirmLoadingLabel="Adding Contacts..."
               excludedContactIds={
                  recipients.map(recipient => recipient.contactId)
               }
            />
         )}

         {showCancelConfirmation && (
            <ConfirmModal
               confirmLabel="Cancel Send"
               description="Emails already accepted by the SMTP provider cannot be recalled. MailerJS will stop sending to any remaining recipients."
               error={cancelError}
               errorRef={cancelFeedbackRef}
               loading={cancelling}
               loadingLabel="Cancelling..."
               onCancel={handleCloseCancelConfirmation}
               onConfirm={handleCancelCampaignSend}
               title="Cancel campaign send?"
            />
         )}
      </div>
   );
}

export default CampaignDetails;
