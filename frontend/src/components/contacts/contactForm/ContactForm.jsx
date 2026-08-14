import { useState } from "react";
import styles from "./contactForm.module.css";

function ContactForm({ contact,onCancel }) {
   const [firstName,setFirstName] = useState(contact?.firstName || "");
   const [lastName,setLastName] = useState(contact?.lastName || "");
   const [email,setEmail] = useState(contact?.email || "");
   const [company,setCompany] = useState(contact?.company || "");
   const [phone,setPhone] = useState(contact?.phone || "");
   const [status,setStatus] = useState(contact?.status || "active");

   const isEditing = Boolean(contact);

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <button
               className={styles.backButton}
               onClick={onCancel}
            >
               ← Back to Contacts
            </button>

            <h1>
               {isEditing ? "Edit Contact" : "Add Contact"}
            </h1>

            <p>
               {isEditing
                  ? "Update contact information."
                  : "Add a new contact to your audience."}
            </p>
         </div>

         <div className={styles.card}>
            <div className={styles.form}>
               <label className={styles.field}>
                  <span>First Name</span>

                  <input
                     type="text"
                     value={firstName}
                     onChange={(event) => setFirstName(event.target.value)}
                     placeholder="Fadel"
                  />
               </label>

               <label className={styles.field}>
                  <span>Last Name</span>

                  <input
                     type="text"
                     value={lastName}
                     onChange={(event) => setLastName(event.target.value)}
                     placeholder="Mkahal"
                  />
               </label>

               <label className={styles.field}>
                  <span>Email</span>

                  <input
                     type="email"
                     value={email}
                     onChange={(event) => setEmail(event.target.value)}
                     placeholder="fadel@example.com"
                  />
               </label>

               <label className={styles.field}>
                  <span>Company</span>

                  <input
                     type="text"
                     value={company}
                     onChange={(event) => setCompany(event.target.value)}
                     placeholder="Example Inc."
                  />
               </label>

               <label className={styles.field}>
                  <span>Phone</span>

                  <input
                     type="tel"
                     value={phone}
                     onChange={(event) => setPhone(event.target.value)}
                     placeholder="+961 70 123 456"
                  />
               </label>

               <label className={styles.field}>
                  <span>Status</span>

                  <select
                     value={status}
                     onChange={(event) => setStatus(event.target.value)}
                  >
                     <option value="active">
                        Active
                     </option>

                     <option value="inactive">
                        Inactive
                     </option>
                  </select>
               </label>
            </div>

            <div className={styles.tagsSection}>
               <span>Tags</span>

               <div className={styles.tags}>
                  <span>Customer ×</span>
                  <span>Developer ×</span>

                  <button>
                     + Add Tag
                  </button>
               </div>
            </div>

            <div className={styles.actions}>
               <button
                  className={styles.cancelButton}
                  onClick={onCancel}
               >
                  Cancel
               </button>

               <button className={styles.saveButton}>
                  {isEditing ? "Save Changes" : "Add Contact"}
               </button>
            </div>
         </div>
      </div>
   );
}

export default ContactForm;