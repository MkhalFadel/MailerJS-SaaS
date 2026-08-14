import { useMemo,useState } from "react";
import styles from "./contactList.module.css";

function ContactList({
   contacts,
   onCreate,
   onEdit,
   onDetails,
   onImport
}) {
   const [search,setSearch] = useState("");
   const [status,setStatus] = useState("all");

   const filteredContacts = useMemo(() => {
      return contacts.filter((contact) => {
         const fullName = `${contact.firstName} ${contact.lastName}`;

         const matchesSearch =
            fullName.toLowerCase().includes(search.toLowerCase()) ||
            contact.email.toLowerCase().includes(search.toLowerCase()) ||
            contact.company.toLowerCase().includes(search.toLowerCase());

         const matchesStatus =
            status === "all" || contact.status === status;

         return matchesSearch && matchesStatus;
      });
   },[contacts,search,status]);

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

            <select
               className={styles.filter}
               value={status}
               onChange={(event) => setStatus(event.target.value)}
            >
               <option value="all">
                  All Contacts
               </option>

               <option value="active">
                  Active
               </option>

               <option value="inactive">
                  Inactive
               </option>
            </select>
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
                     <th>Company</th>
                     <th>Status</th>
                     <th>Tags</th>
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
                           <span className={styles.company}>
                              {contact.company}
                           </span>
                        </td>

                        <td>
                           <span
                              className={`${styles.status} ${
                                 contact.status === "active"
                                    ? styles.active
                                    : styles.inactive
                              }`}
                           >
                              {contact.status}
                           </span>
                        </td>

                        <td>
                           <div className={styles.tags}>
                              {contact.tags.map((tag) => (
                                 <span
                                    className={styles.tag}
                                    key={tag}
                                 >
                                    {tag}
                                 </span>
                              ))}
                           </div>
                        </td>

                        <td>
                           <div className={styles.actions}>
                              <button
                                 onClick={() => onDetails(contact)}
                              >
                                 View
                              </button>

                              <button
                                 onClick={() => onEdit(contact)}
                              >
                                 Edit
                              </button>

                              <button>
                                 ⋮
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