import { useMemo,useState } from "react";
import styles from "./contactList.module.css";
import { deleteContact } from "../../../api/contacts";
import EmptyState from "../../feedback/EmptyState";
import ConfirmModal from "../../feedback/ConfirmModal";
import Icon from "../../icons/Icon";

function ContactList({ contacts, setContacts, onCreate, onEdit, onDetails, onImport }) 
{
   const [search, setSearch] = useState("");
   const [contactToDelete, setContactToDelete] = useState(null);
   const [deleteError, setDeleteError] = useState(null);
   const [deleting, setDeleting] = useState(false);

   const filteredContacts = useMemo(() => {
      return contacts.filter((contact) => {
         const fullName = `${contact.firstName} ${contact.lastName}`;

         const matchesSearch =
            fullName.toLowerCase().includes(search.toLowerCase()) ||
            contact.email.toLowerCase().includes(search.toLowerCase());

         return matchesSearch;
      });
   },[contacts, search]);

   function removeContact(id)
   {
      setContacts(current =>
         current.filter(item => item.id !== id)
      );
   }

   function getContactName(contact)
   {
      return `${contact.firstName} ${contact.lastName}`.trim() ||
         contact.email;
   }

   async function requestContactDeletion(contact)
   {
      if(deleting)
         return;

      setDeleteError(null);
      setDeleting(true);

      try {
         await deleteContact(contact.id);
         removeContact(contact.id);
      } catch(error) {
         if(error.status === 409 && error.data?.requiresConfirmation)
         {
            setContactToDelete({
               ...contact,
               campaignCount: error.data.campaignCount
            });
            return;
         }

         console.error("Failed to delete contact:", error);
         setDeleteError(error.message || "Unable to delete this contact.");
      } finally {
         setDeleting(false);
      }
   }

   async function confirmContactDeletion()
   {
      if(!contactToDelete || deleting)
         return;

      setDeleteError(null);
      setDeleting(true);

      try {
         await deleteContact(contactToDelete.id, true);
         removeContact(contactToDelete.id);
         setContactToDelete(null);
      } catch(error) {
         console.error("Failed to delete contact:", error);
         setDeleteError(error.message || "Unable to delete this contact.");
      } finally {
         setDeleting(false);
      }
   }

   function closeContactConfirmation()
   {
      if(deleting)
         return;

      setContactToDelete(null);
      setDeleteError(null);
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
               type="button"
               >
                  <Icon name="upload" size={16} />
                  Import
               </button>

               <button
               className={styles.primaryButton}
               onClick={onCreate}
               type="button"
               >
                  <Icon name="plus" size={16} />
                  Add Contact
               </button>
            </div>
         </div>

         <div className={styles.toolbar}>
            <div className={styles.searchWrapper}>
               <Icon className={styles.searchIcon} name="search" size={18} />

               <input
                  type="text"
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
               />
            </div>
         </div>

         {deleteError && !contactToDelete && (
            <div className={styles.deleteError}>{deleteError}</div>
         )}

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
                              <button onClick={() => onDetails(contact)} type="button">
                                 <Icon name="eye" size={15} />
                                 View
                              </button>

                              <button onClick={() => onEdit(contact)} type="button">
                                 <Icon name="edit" size={15} />
                                 Edit
                              </button>

                              <button
                                 className={styles.deleteButton}
                                 onClick={() => requestContactDeletion(contact)}
                                 type="button"
                              >
                                 <Icon name="trash" size={15} />
                                 Delete
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>

            {filteredContacts.length === 0 && (
               <EmptyState
                  actionLabel="Add Contact"
                  description="Try changing your search or add a new contact."
                  icon="contacts"
                  onAction={onCreate}
                  title="No contacts found"
               />
            )}
         </div>

         <div className={styles.footer}>
            Showing {filteredContacts.length} of {contacts.length} contacts
         </div>

         {contactToDelete && (
            <ConfirmModal
               confirmLabel="Delete Contact"
               description={`${getContactName(contactToDelete)} is currently used in ${contactToDelete.campaignCount} campaign${contactToDelete.campaignCount === 1 ? "" : "s"}. Deleting this contact will remove it from those campaign recipient lists. Existing campaign delivery history will be preserved.`}
               error={deleteError}
               loading={deleting}
               onCancel={closeContactConfirmation}
               onConfirm={confirmContactDeletion}
               title="Delete contact?"
            />
         )}
      </div>
   );
}

export default ContactList;
