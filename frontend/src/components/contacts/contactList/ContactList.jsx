import { useMemo,useState } from "react";
import styles from "./contactList.module.css";
import { deleteContact } from "../../../api/contacts";

function ContactList({ contacts, setContacts, onCreate, onEdit, onDetails, onImport }) 
{
   const [search, setSearch] = useState("");

   const filteredContacts = useMemo(() => {
      return contacts.filter((contact) => {
         const fullName = `${contact.firstName} ${contact.lastName}`;

         const matchesSearch =
            fullName.toLowerCase().includes(search.toLowerCase()) ||
            contact.email.toLowerCase().includes(search.toLowerCase());

         return matchesSearch;
      });
   },[contacts, search]);

   async function deleteContacts(id)
   {
      try {
         await deleteContact(id);

         setContacts(current =>
            current.filter(item => item.id !== id)
         );
      } catch (error) {
         console.log(error)
      }
   }

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <h1>Contacts</h1>

               <p>
                  Manage the people you send emails to.
               </p>
            </div>

            <div className={styles.headerActions}>
               <button
                  className={styles.secondaryButton}
                  onClick={onImport}
               >
                  Import
               </button>

               <button
                  className={styles.primaryButton}
                  onClick={onCreate}
               >
                  + Add Contact
               </button>
            </div>
         </div>

         <div className={styles.toolbar}>
            <div className={styles.searchWrapper}>
               <span className={styles.searchIcon}>
                  ⌕
               </span>

               <input
                  type="text"
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
               />
            </div>
         </div>

         <div className={styles.tableWrapper}>
            <table className={styles.table}>
               <thead>
                  <tr>
                     <th>
                        <input
                           type="checkbox"
                           aria-label="Select all contacts"
                        />
                     </th>

                     <th>Name</th>
                     <th>Email</th>
                     <th>Actions</th>
                  </tr>
               </thead>

               <tbody>
                  {filteredContacts.map((contact) => (
                     <tr key={contact.id}>
                        <td>
                           <input
                              type="checkbox"
                              aria-label={`Select ${contact.email}`}
                           />
                        </td>

                        <td>
                           <button
                              className={styles.nameButton}
                              onClick={() => onDetails(contact)}
                           >
                              <span className={styles.avatar}>
                                 {contact.firstName.charAt(0)}
                                 {contact.lastName.charAt(0)}
                              </span>

                              <span>
                                 {contact.firstName} {contact.lastName}
                              </span>
                           </button>
                        </td>

                        <td>
                           <span className={styles.email}>
                              {contact.email}
                           </span>
                        </td>

                        <td>
                           <div className={styles.actions}>
                              <button onClick={() => onDetails(contact)}>
                                 View
                              </button>

                              <button onClick={() => onEdit(contact)}>
                                 Edit
                              </button>

                              <button onClick={() => deleteContacts(contact.id)}>
                                 delete
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>

            {filteredContacts.length === 0 && (
               <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                     ◉
                  </div>

                  <h2>No contacts found</h2>

                  <p>
                     Try changing your search or add a new contact.
                  </p>

                  <button
                     className={styles.primaryButton}
                     onClick={onCreate}
                  >
                     Add Contact
                  </button>
               </div>
            )}
         </div>

         <div className={styles.footer}>
            Showing {filteredContacts.length} of {contacts.length} contacts
         </div>
      </div>
   );
}

export default ContactList;