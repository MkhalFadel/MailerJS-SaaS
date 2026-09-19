import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import ContactList from "../../components/contacts/contactList/ContactList";
import ContactForm from "../../components/contacts/contactForm/ContactForm";
import ContactDetails from "../../components/contacts/contactDetails/ContactDetails";
import ImportContacts from "../../components/contacts/importContacts/ImportContacts";
import FeedbackState from "../../components/feedback/FeedbackState";
import { getContacts } from "../../api/contacts";
import styles from "./contacts.module.css";

function Contacts() {
   const [view, setView] = useState("list");
   const [selectedContact, setSelectedContact] = useState(null);
   const [contacts, setContacts] = useState([]); 
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);


   useEffect(() => {
      async function loadContacts()
      {
         try {
            const response = await getContacts();

            setContacts(response.data);
         } catch(error) {
            console.error("Failed to fetch contacts:",error);
            setError(error);
         } finally {
            setLoading(false);
         }
      }

      loadContacts();
   },[]);

   function handleCreate() {
      setSelectedContact(null);
      setView("form");
   }

   function handleEdit(contact) {
      setSelectedContact(contact);
      setView("form");
   }

   function handleDetails(contact) {
      setSelectedContact(contact);
      setView("details");
   }

   function handleImport() {
      setView("import");
   }

   function handleBack() {
      setSelectedContact(null);
      setView("list");
   }

   async function handleImportedContacts()
   {
      try {
         const response = await getContacts();

         setContacts(response.data);
      } catch(error) {
         console.error("Failed to refresh imported contacts:", error);
      }
   }

   return (
      <DashboardLayout>
         <div className={styles.page}>
            {loading && (
               <FeedbackState>
                  Loading contacts...
               </FeedbackState>
            )}

            {!loading && error && (
               <FeedbackState type="error">
                  Failed to load contacts.
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
               />
            )}

            {!loading && !error && view === "form" && (
               <ContactForm
                  contact={selectedContact}
                  setContacts={setContacts}
                  onCancel={handleBack}
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
