import { useState } from "react";
import styles from "./senderSettings.module.css";

function SenderSettings() {
   const [senderName,setSenderName] = useState("Fadel Mkahal");
   const [senderEmail,setSenderEmail] = useState("fadel@example.com");
   const [replyTo,setReplyTo] = useState("support@example.com");

   function handleSave(event) {
      event.preventDefault();
   }

   return (
      <div className={styles.container}>
         <div className={styles.sectionHeader}>
            <h2>Sender Settings</h2>

            <p>
               Configure the sender information that will appear on your emails.
            </p>
         </div>

         <form
            className={styles.card}
            onSubmit={handleSave}
         >
            <div className={styles.form}>
               <div className={styles.senderPreview}>
                  <div className={styles.previewIcon}>
                     F
                  </div>

                  <div>
                     <span>Sender Preview</span>

                     <strong>
                        {senderName || "Your Name"}
                     </strong>

                     <small>
                        {senderEmail || "you@example.com"}
                     </small>
                  </div>
               </div>

               <label className={styles.field}>
                  <span>Sender Name</span>

                  <input
                     type="text"
                     value={senderName}
                     onChange={(event) => setSenderName(event.target.value)}
                     placeholder="Your Name"
                  />

                  <small>
                     This name will be displayed to recipients.
                  </small>
               </label>

               <label className={styles.field}>
                  <span>Sender Email</span>

                  <input
                     type="email"
                     value={senderEmail}
                     onChange={(event) => setSenderEmail(event.target.value)}
                     placeholder="you@example.com"
                  />

                  <small>
                     This must match your authenticated SMTP account.
                  </small>
               </label>

               <label className={styles.field}>
                  <span>Reply-To Email</span>

                  <input
                     type="email"
                     value={replyTo}
                     onChange={(event) => setReplyTo(event.target.value)}
                     placeholder="support@example.com"
                  />

                  <small>
                     Replies from recipients will be sent to this address.
                  </small>
               </label>
            </div>

            <div className={styles.actions}>
               <button
                  type="submit"
                  className={styles.saveButton}
               >
                  Save Changes
               </button>
            </div>
         </form>
      </div>
   );
}

export default SenderSettings;