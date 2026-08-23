import { useState } from "react";
import styles from "./contactForm.module.css";
import { createContact, updateContact } from "../../../api/contacts";

function ContactForm({ contact, setContacts, onCancel }) {
   const [firstName, setFirstName] = useState(contact?.firstName || "");
   const [lastName, setLastName] = useState(contact?.lastName || "");
   const [email, setEmail] = useState(contact?.email || "");

   const isEditing = Boolean(contact);

   async function createNewContact()
   {
      try {
         const res = await createContact({
            email,
            firstName, 
            lastName
         })

         const newContact = res.data;

         setContacts(current => ([
            ...current,
            newContact
         ]))

         onCancel();
      } catch (error) {
         console.log(error);
      }
   }

   async function editContact()
   {
      try {
         const res = await updateContact(contact.id, {
            email,
            firstName, 
            lastName
         });

         const editedContact = res.data;

         setContacts(current =>
            current.map(item =>
               item.id === editedContact.id ? editedContact : item
            )
         );

         onCancel();
      } catch (error) {
         console.log(error);
      }
   }

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
            </div>

            <div className={styles.actions}>
               <button
                  className={styles.cancelButton}
                  onClick={onCancel}
               >
                  Cancel
               </button>

               <button
                  className={styles.saveButton}
                  onClick={isEditing ? editContact : createNewContact}
               >
                  {isEditing ? "Save Changes" : "Add Contact"}
               </button>
            </div>
         </div>
      </div>
   );
}

export default ContactForm;