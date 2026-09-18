import { useEffect, useState } from "react";
import styles from "./campaignForm.module.css";
import { getTemplates } from "../../../api/templates";
import { getSmtpAccounts } from "../../../api/smtp";
import { createCampaign, addCampaignRecipients } from "../../../api/campaigns";
import { getContacts } from "../../../api/contacts";
import ContactSelector from "../contactSelector/ContactSelector";
import Icon from "../../icons/Icon";
import BackButton from "../../navigation/BackButton";

function CampaignForm({ onCancel, onCreated })
{
   const [formData, setFormData] = useState({
      name: "",
      subject: "",
      templateId: "",
      smtpAccountId: ""
   });

   const [templates, setTemplates] = useState([]);
   const [smtpAccounts, setSmtpAccounts] = useState([]);

   const [selectedContacts, setSelectedContacts] = useState([]);
   const [contacts, setContacts] = useState([]);
   const [showContactSelector, setShowContactSelector] = useState(false);
   const [loadingContacts, setLoadingContacts] = useState(false);

   const [loadingOptions, setLoadingOptions] = useState(true);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [createdCampaign, setCreatedCampaign] = useState(null);

   useEffect(() => {
      async function loadOptions()
      {
         try {
            const [templatesResponse, smtpResponse] = await Promise.all([
               getTemplates(),
               getSmtpAccounts()
            ]);

            setTemplates(templatesResponse.data);
            setSmtpAccounts(smtpResponse.data);

            setFormData(current => ({
               ...current,
               templateId: templatesResponse.data[0]?.id || "",
               smtpAccountId: smtpResponse.data[0]?.id || ""
            }));
         } catch(error) {
            console.error("Failed to load campaign options:", error);

            setError(error.message || "Unable to load campaign options.");
         } finally {
            setLoadingOptions(false);
         }
      }

      loadOptions();
   },[]);

   function handleChange(event)
   {
      const { name, value } = event.target;

      setFormData(current => ({
         ...current,
         [name]: value
      }));
   }

   async function handleCreateCampaign()
   {
      setLoading(true);
      setError(null);

      try {
         const response = await createCampaign(formData);

         const campaign = response.data;

         const contactIds = selectedContacts.map(contact => contact.id);

         try
         {
            await addCampaignRecipients(campaign.id, contactIds);
         }
         catch(error)
         {
            console.error("Failed to add campaign recipients:", error);

            setCreatedCampaign(campaign);

            if(onCreated)
               onCreated(campaign);

            setError("Campaign was created, but its recipients could not be added. Open it from the campaign list to try again.");
            return;
         }

         if(onCreated)
            onCreated({
               ...campaign,
               recipients: selectedContacts.length
            });

         onCancel();
      } catch(error) {
         console.error("Failed to create campaign:", error);

         setError(error.message || "Unable to create campaign.");
      } finally {
         setLoading(false);
      }
   }

   function handleSubmit(event)
   {
      event.preventDefault();

      if(!formData.name.trim())
      {
         setError("Campaign name is required.");
         return;
      }

      if(!formData.subject.trim())
      {
         setError("Subject is required.");
         return;
      }

      if(!formData.templateId)
      {
         setError("Please select a template.");
         return;
      }

      if(!formData.smtpAccountId)
      {
         setError("Please select an SMTP account.");
         return;
      }

      if(selectedContacts.length === 0)
      {
         setError("Please select at least one contact.");
         return;
      }

      handleCreateCampaign();
   }

   async function handleChooseContacts()
   {
      setLoadingContacts(true);
      setError(null);

      try {
         const response = await getContacts();

         setContacts(response.data);
         setShowContactSelector(true);
      } catch(error) {
         console.error("Failed to fetch contacts:",error);

         setError(
            error.message ||
            "Unable to load contacts."
         );
      } finally {
         setLoadingContacts(false);
      }
   }

   function removeSelectedContact(contactId)
   {
      setSelectedContacts(current =>
         current.filter(contact => contact.id !== contactId)
      );
   }

   const canCreateCampaign =
      !loadingOptions &&
      templates.length > 0 &&
      smtpAccounts.length > 0;

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <BackButton onClick={onCancel}>
                  Back to Campaigns
               </BackButton>

               <h1>Create Campaign</h1>

               <p>
                  Create and configure a new email campaign.
               </p>
            </div>
         </div>

         {error && (
            <div className={styles.error}>
               {error}
            </div>
         )}

         <form
            className={styles.formCard}
            onSubmit={handleSubmit}
         >
            <div className={styles.section}>
               <div className={styles.sectionHeader}>
                  <h2>Campaign Information</h2>

                  <p>
                     Basic information about your campaign.
                  </p>
               </div>

               <div className={styles.formGrid}>
                  <label className={styles.field}>
                     <span>Campaign Name</span>

                     <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Summer Newsletter"
                     />
                  </label>

                  <label className={styles.field}>
                     <span>Subject</span>

                     <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Summer deals are here!"
                     />
                  </label>
               </div>
            </div>

            <div className={styles.section}>
               <div className={styles.sectionHeader}>
                  <h2>Email Content</h2>

                  <p>
                     Choose the template that will be used for this campaign.
                  </p>
               </div>

               <label className={styles.field}>
                  <span>Template</span>

                  <select
                     name="templateId"
                     value={formData.templateId}
                     onChange={handleChange}
                     disabled={loadingOptions || templates.length === 0}
                  >
                     <option value="">
                        Select a template
                     </option>

                     {templates.map((template) => (
                        <option
                           key={template.id}
                           value={template.id}
                        >
                           {template.name}
                        </option>
                     ))}
                  </select>
               </label>

               {!loadingOptions && templates.length === 0 && (
                  <p>
                     You need to create a template before creating a campaign.
                  </p>
               )}
            </div>

            <div className={styles.section}>
               <div className={styles.sectionHeader}>
                  <h2>Sending Account</h2>

                  <p>
                     Choose the SMTP account that will send this campaign.
                  </p>
               </div>

               <label className={styles.field}>
                  <span>SMTP Account</span>

                  <select
                     name="smtpAccountId"
                     value={formData.smtpAccountId}
                     onChange={handleChange}
                     disabled={
                        loadingOptions ||
                        smtpAccounts.length === 0
                     }
                  >
                     <option value="">
                        Select an SMTP account
                     </option>

                     {smtpAccounts.map((account) => (
                        <option
                           key={account.id}
                           value={account.id}
                        >
                           {account.provider} — {account.senderEmail}
                        </option>
                     ))}
                  </select>
               </label>

               {!loadingOptions && smtpAccounts.length === 0 && (
                  <p>
                     You need to add an SMTP account before creating a campaign.
                  </p>
               )}
            </div>

            <div className={styles.section}>
               <div className={styles.sectionHeader}>
                  <h2>Recipients</h2>

                  <p>
                     Select the contacts that should receive this campaign.
                  </p>
               </div>

               <button
                  type="button"
                  className={styles.selectButton}
                  onClick={handleChooseContacts}
                  disabled={loadingContacts || loading || createdCampaign}
               >
                  <span>
                     {loadingContacts
                        ? "Loading Contacts..."
                        : selectedContacts.length > 0
                           ? `${selectedContacts.length} contacts selected`
                           : "Choose Contacts"}
                  </span>

                  <Icon name="arrowRight" size={18} />
               </button>

               {selectedContacts.length > 0 && (
                  <div className={styles.selectedContacts}>
                     {selectedContacts.map((contact) => (
                        <div
                           className={styles.selectedContact}
                           key={contact.id}
                        >
                           <div>
                              <strong>
                                 {contact.firstName} {contact.lastName}
                              </strong>

                              <span>
                                 {contact.email}
                              </span>
                           </div>

                           <button
                              type="button"
                              onClick={() => removeSelectedContact(contact.id)}
                              aria-label={`Remove ${contact.email}`}
                           >
                              <Icon name="close" size={15} />
                              Remove
                           </button>
                        </div>
                     ))}
                  </div>
               )}

               {showContactSelector && (
                  <ContactSelector
                     contacts={contacts}
                     selectedContacts={selectedContacts}
                     setSelectedContacts={setSelectedContacts}
                     onClose={() => setShowContactSelector(false)}
                  />
               )}
            </div>

            <div className={styles.formActions}>
               <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={onCancel}
                  disabled={loading}
               >
                  Cancel
               </button>

               <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={
                     loading ||
                     createdCampaign ||
                     loadingOptions ||
                     !canCreateCampaign ||
                     selectedContacts.length === 0
                  }
               >
                  <Icon name={createdCampaign ? "check" : "plus"} size={16} />
                  {createdCampaign
                     ? "Campaign Created"
                     : loading
                        ? "Creating..."
                        : "Create Campaign"}
               </button>
            </div>
         </form>
      </div>
   );
}

export default CampaignForm;
