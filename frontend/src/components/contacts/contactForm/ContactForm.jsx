import { useState } from "react";
import styles from "./contactForm.module.css";
import { createContact, updateContact } from "../../../api/contacts";
import Icon from "../../icons/Icon";
import BackButton from "../../navigation/BackButton";
import FeedbackState from "../../feedback/FeedbackState";
import useFeedbackScroll from "../../../hooks/useFeedbackScroll";

function ContactForm({ contact, setContacts, onCancel, onSuccess }) {
   const [firstName, setFirstName] = useState(contact?.firstName || "");
   const [lastName, setLastName] = useState(contact?.lastName || "");
   const [email, setEmail] = useState(contact?.email || "");
   const [error, setError] = useState(null);
   const [saving, setSaving] = useState(false);
   const { feedbackRef, requestFeedbackScroll } = useFeedbackScroll(error);

   const isEditing = Boolean(contact);

   async function handleSubmit(event)
   {
      event.preventDefault();

      if(saving)
         return;

      setError(null);
      setSaving(true);

      try {
         if(isEditing)
         {
            const response = await updateContact(contact.id, {
               email,
               firstName,
               lastName
            });

            setContacts(current =>
               current.map(item =>
                  item.id === response.data.id ? response.data : item
               )
            );
         }
         else
         {
            const response = await createContact({
               email,
               firstName,
               lastName
            });

            setContacts(current => ([
               ...current,
               response.data
            ]));
         }

         onSuccess?.(
            isEditing
               ? "Contact updated successfully."
               : "Contact added successfully."
         );
         onCancel();
      } catch (error) {
         console.error("Unable to save contact:", error);
         requestFeedbackScroll();
         setError(error.message || "Unable to save this contact.");
      } finally {
         setSaving(false);
      }
   }

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <BackButton onClick={onCancel}>
               Back to Contacts
            </BackButton>

            <h1>
               {isEditing ? "Edit Contact" : "Add Contact"}
            </h1>

            <p>
               {isEditing
                  ? "Update contact information."
                  : "Add a new contact to your audience."}
            </p>
         </div>

         {error && (
            <FeedbackState feedbackRef={feedbackRef} type="error">
               {error}
            </FeedbackState>
         )}

         <form
            aria-busy={saving}
            className={styles.card}
            onSubmit={handleSubmit}
         >
            <div className={styles.form}>
               <label className={styles.field}>
                  <span>First Name</span>

                  <input
                     type="text"
                     value={firstName}
                     onChange={(event) => setFirstName(event.target.value)}
                     placeholder="Fadel"
                     disabled={saving}
                  />
               </label>

               <label className={styles.field}>
                  <span>Last Name</span>

                  <input
                     type="text"
                     value={lastName}
                     onChange={(event) => setLastName(event.target.value)}
                     placeholder="Mkahal"
                     disabled={saving}
                  />
               </label>

               <label className={styles.field}>
                  <span>Email</span>

                  <input
                     type="email"
                     value={email}
                     onChange={(event) => setEmail(event.target.value)}
                     placeholder="fadel@example.com"
                     disabled={saving}
                  />
               </label>
            </div>

            <div className={styles.actions}>
               <button
               className={styles.cancelButton}
               disabled={saving}
               onClick={onCancel}
               type="button"
               >
                  Cancel
               </button>

               <button
               className={styles.saveButton}
               disabled={saving}
               type="submit"
               >
                  <Icon name={isEditing ? "edit" : "plus"} size={16} />
                  {saving
                     ? "Saving..."
                     : isEditing
                        ? "Save Changes"
                        : "Add Contact"}
               </button>
            </div>
         </form>
      </div>
   );
}

export default ContactForm;
