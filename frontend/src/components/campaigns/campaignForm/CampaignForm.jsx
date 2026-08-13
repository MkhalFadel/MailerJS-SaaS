import { useState } from "react";
import styles from "./campaignForm.module.css";

function CampaignForm({ onCancel }) {
   const [messageType, setMessageType] = useState("plain");

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <button
                  className={styles.backButton}
                  onClick={onCancel}
               >
                  ← Back to Campaigns
               </button>

               <h1>Create Campaign</h1>
               <p>Create and configure a new email campaign.</p>
            </div>
         </div>

         <div className={styles.formCard}>
            <div className={styles.section}>
               <div className={styles.sectionHeader}>
                  <h2>Campaign Information</h2>
                  <p>Basic information about your campaign.</p>
               </div>

               <div className={styles.formGrid}>
                  <label className={styles.field}>
                     <span>Campaign Name</span>
                     <input
                        type="text"
                        placeholder="Summer Newsletter"
                     />
                  </label>

                  <label className={styles.field}>
                     <span>Subject</span>
                     <input
                        type="text"
                        placeholder="Summer deals are here!"
                     />
                  </label>
               </div>
            </div>

            <div className={styles.section}>
               <div className={styles.sectionHeader}>
                  <h2>Message</h2>
                  <p>Choose how you want to create your email.</p>
               </div>

               <div className={styles.messageTypes}>
                  <button
                     className={`${styles.messageType} ${
                        messageType === "plain" ? styles.selected : ""
                     }`}
                     onClick={() => setMessageType("plain")}
                  >
                     <strong>Plain Text</strong>
                     <span>Write a simple text email.</span>
                  </button>

                  <button
                     className={`${styles.messageType} ${
                        messageType === "html" ? styles.selected : ""
                     }`}
                     onClick={() => setMessageType("html")}
                  >
                     <strong>HTML</strong>
                     <span>Create a custom HTML email.</span>
                  </button>

                  <button
                     className={`${styles.messageType} ${
                        messageType === "template" ? styles.selected : ""
                     }`}
                     onClick={() => setMessageType("template")}
                  >
                     <strong>Template</strong>
                     <span>Use an existing email template.</span>
                  </button>
               </div>

               <textarea
                  className={styles.message}
                  placeholder="Write your email message..."
                  rows="9"
               />
            </div>

            <div className={styles.section}>
               <div className={styles.sectionHeader}>
                  <h2>Recipients</h2>
                  <p>Select who should receive this campaign.</p>
               </div>

               <button className={styles.selectButton}>
                  <span>Choose Contacts</span>
                  <span>→</span>
               </button>
            </div>

            <div className={styles.section}>
               <div className={styles.sectionHeader}>
                  <h2>CC & BCC</h2>
                  <p>Optional additional recipients.</p>
               </div>

               <div className={styles.formGrid}>
                  <label className={styles.field}>
                     <span>CC</span>
                     <input
                        type="text"
                        placeholder="email@example.com"
                     />
                  </label>

                  <label className={styles.field}>
                     <span>BCC</span>
                     <input
                        type="text"
                        placeholder="email@example.com"
                     />
                  </label>
               </div>
            </div>

            <div className={styles.section}>
               <div className={styles.sectionHeader}>
                  <h2>Attachments</h2>
                  <p>Add files to your campaign.</p>
               </div>

               <button className={styles.uploadButton}>
                  <span>＋</span>
                  Add Attachment
               </button>
            </div>

            <div className={styles.formActions}>
               <button
                  className={styles.cancelButton}
                  onClick={onCancel}
               >
                  Cancel
               </button>

               <button className={styles.draftButton}>
                  Save Draft
               </button>

               <button className={styles.primaryButton}>
                  Continue
               </button>
            </div>
         </div>
      </div>
   );
}

export default CampaignForm;