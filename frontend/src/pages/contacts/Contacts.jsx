import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import ContactList from "../../components/contacts/contactList/ContactList";
import ContactForm from "../../components/contacts/contactForm/ContactForm";
import ContactDetails from "../../components/contacts/contactDetails/ContactDetails";
import ImportContacts from "../../components/contacts/importContacts/ImportContacts";
import FeedbackState from "../../components/feedback/FeedbackState";
import { getContacts } from "../../api/contacts";
import useFeedbackScroll from "../../hooks/useFeedbackScroll";
import styles from "./contacts.module.css";

function Contacts() {
   const [view, setView] = useState("list");
   const [selectedContact, setSelectedContact] = useState(null);
   const [contacts, setContacts] = useState([]); 
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [feedback, setFeedback] = useState(null);
   const { feedbackRef, requestFeedbackScroll } = useFeedbackScroll(feedback?.message);


   useEffect(() => {
      async function loadContacts()
      {
         try {
            const response = await getContacts();

            setContacts(response.data);
         } catch(error) {
            console.error("Failed to fetch contacts:",error);
            setError(error.message || "Failed to load contacts.");
         } finally {
            setLoading(false);
         }
      }

      loadContacts();
   },[]);

   function handleCreate() {
      setFeedback(null);
      setSelectedContact(null);
      setView("form");
   }

   function handleEdit(contact) {
      setFeedback(null);
      setSelectedContact(contact);
      setView("form");
   }

   function handleDetails(contact) {
      setSelectedContact(contact);
      setView("details");
   }

   function handleImport() {
      setFeedback(null);
      setView("import");
   }

   function handleBack() {
      setSelectedContact(null);
      setView("list");
   }

   function handleFeedback(type, message)
   {
      if(type === "clear")
      {
         setFeedback(null);
         return;
      }

      requestFeedbackScroll();
      setFeedback({ type, message });
   }

   async function handleImportedContacts()
   {
      try {
         const response = await getContacts();

         setContacts(response.data);
      } catch(error) {
         console.error("Failed to refresh imported contacts:", error);
         handleFeedback("error", error.message || "Contacts were imported, but the list could not be refreshed.");
      }
   }

   return (
      <DashboardLayout>
         <div className={styles.page}>
            {feedback && (
               <FeedbackState feedbackRef={feedbackRef} type={feedback.type}>
                  {feedback.message}
               </FeedbackState>
            )}

            {loading && (
               <FeedbackState>
                  Loading contacts...
               </FeedbackState>
            )}

            {!loading && error && (
               <FeedbackState type="error">
                  {error}
               </FeedbackState>
            )}

            {!loading && !error && view === "list" && (
               <ContactList
                  contacts={contacts}
                  setContacts={setContacts}
                  onCreate={handleCreate}
                  onEdit={handleEdit}
                  onDetails={handleDetails}
                  onImport={handleImport}
                  onFeedback={handleFeedback}
               />
            )}

            {!loading && !error && view === "form" && (
               <ContactForm
                  contact={selectedContact}
                  setContacts={setContacts}
                  onCancel={handleBack}
                  onSuccess={(message) => handleFeedback("success", message)}
               />
            )}

            {!loading && !error && view === "details" && selectedContact && (
               <ContactDetails
                  contact={selectedContact}
                  onBack={handleBack}
                  onEdit={() => handleEdit(selectedContact)}
               />
            )}

            {!loading && !error && view === "import" && (
               <ImportContacts
                  onCancel={handleBack}
                  onImported={handleImportedContacts}
               />
            )}
         </div>
      </DashboardLayout>
   );
}

export default Contacts;
