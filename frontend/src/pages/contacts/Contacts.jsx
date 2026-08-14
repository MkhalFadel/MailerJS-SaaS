import { useState } from "react";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import ContactList from "../../components/contacts/contactList/ContactList";
import ContactForm from "../../components/contacts/contactForm/ContactForm";
import ContactDetails from "../../components/contacts/contactDetails/ContactDetails";
import ImportContacts from "../../components/contacts/importContacts/ImportContacts";
import styles from "./contacts.module.css";

const contactsData = [
   {
      id: 1,
      firstName: "Fadel",
      lastName: "Mkahal",
      email: "fadel@example.com",
      company: "Example Inc.",
      phone: "+961 70 123 456",
      status: "active",
      tags: ["Developer", "Customer"],
      createdAt: "Aug 10, 2026"
   },
   {
      id: 2,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      company: "Acme Corp.",
      phone: "+1 555 123 4567",
      status: "active",
      tags: ["Customer"],
      createdAt: "Aug 8, 2026"
   },
   {
      id: 3,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      company: "Tech Labs",
      phone: "+1 555 987 6543",
      status: "inactive",
      tags: ["Lead"],
      createdAt: "Aug 5, 2026"
   },
   {
      id: 4,
      firstName: "Michael",
      lastName: "Brown",
      email: "michael@example.com",
      company: "Startup Labs",
      phone: "+44 20 1234 5678",
      status: "active",
      tags: ["Lead", "Newsletter"],
      createdAt: "Aug 2, 2026"
   }
];

function Contacts() {
   const [view,setView] = useState("list");
   const [selectedContact,setSelectedContact] = useState(null);

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

   return (
      <DashboardLayout>
         <div className={styles.page}>
            {view === "list" && (
               <ContactList
                  contacts={contactsData}
                  onCreate={handleCreate}
                  onEdit={handleEdit}
                  onDetails={handleDetails}
                  onImport={handleImport}
               />
            )}

            {view === "form" && (
               <ContactForm
                  contact={selectedContact}
                  onCancel={handleBack}
               />
            )}

            {view === "details" && selectedContact && (
               <ContactDetails
                  contact={selectedContact}
                  onBack={handleBack}
                  onEdit={() => handleEdit(selectedContact)}
               />
            )}

            {view === "import" && (
               <ImportContacts
                  onCancel={handleBack}
               />
            )}
         </div>
      </DashboardLayout>
   );
}

export default Contacts;