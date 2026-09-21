import { useMemo, useState } from "react";
import styles from "./contactSelector.module.css";
import Icon from "../../icons/Icon";

function ContactSelector({
   contacts,
   selectedContacts,
   setSelectedContacts,
   onClose,
   onConfirm,
   excludedContactIds = [],
   confirmDisabled = false,
   confirmLoadingLabel = "Saving..."
})
{
   const [search, setSearch] = useState("");

   const filteredContacts = useMemo(() => {
      const value = search.toLowerCase().trim();

      const excludedIds = new Set(excludedContactIds);

      const availableContacts = contacts.filter(
         contact => !excludedIds.has(contact.id)
      );

      if(!value)
         return availableContacts;

      return availableContacts.filter((contact) => {
         const fullName = `${contact.firstName} ${contact.lastName}`
            .toLowerCase();

         return (
            fullName.includes(value) ||
            contact.email.toLowerCase().includes(value)
         );
      });
   },[contacts,search,excludedContactIds]);

   function isSelected(contactId)
   {
      return selectedContacts.some(
         contact => contact.id === contactId
      );
   }

   function handleToggle(contact)
   {
      setSelectedContacts(current => {
         if(isSelected(contact.id))
         {
            return current.filter(
               item => item.id !== contact.id
            );
         }

         return [
            ...current,
            contact
         ];
      });
   }

   function handleSelectAll()
   {
      const filteredIds = new Set(
         filteredContacts.map(contact => contact.id)
      );

      const allSelected = filteredContacts.every(
         contact => isSelected(contact.id)
      );

      if(allSelected)
      {
         setSelectedContacts(current =>
            current.filter(
               contact => !filteredIds.has(contact.id)
            )
         );

         return;
      }

      setSelectedContacts(current => {
         const existingIds = new Set(
            current.map(contact => contact.id)
         );

         const newContacts = filteredContacts.filter(
            contact => !existingIds.has(contact.id)
         );

         return [
            ...current,
            ...newContacts
         ];
      });
   }


   function handleConfirm()
   {
      if(onConfirm)
      {
         onConfirm();
         return;
      }

      onClose();
   }

   return (
      <div className={styles.overlay}>
         <div aria-busy={confirmDisabled} className={styles.modal}>
            <div className={styles.header}>
               <div>
                  <h2>Choose Contacts</h2>

                  <p>
                     Select the contacts that should receive this campaign.
                  </p>
               </div>

               <button
                  type="button"
                  className={styles.closeButton}
                  disabled={confirmDisabled}
                  onClick={onClose}
                  aria-label="Close contact selector"
               >
                  <Icon name="close" size={20} />
               </button>
            </div>

            <div className={styles.toolbar}>
               <div className={styles.searchField}>
                  <Icon name="search" size={17} />

                  <input
                     type="text"
                     placeholder="Search contacts..."
                     value={search}
                     onChange={(event) =>
                        setSearch(event.target.value)
                     }
                     disabled={confirmDisabled}
                  />
               </div>

               <button
                  type="button"
                  className={styles.selectAllButton}
                  onClick={handleSelectAll}
                  disabled={confirmDisabled || filteredContacts.length === 0}
               >
                  {filteredContacts.length > 0 &&
                  filteredContacts.every(
                     contact => isSelected(contact.id)
                  )
                     ? "Clear All"
                     : "Select All"}
               </button>
            </div>

            <div className={styles.selectedSummary}>
               <span>
                  {selectedContacts.length} selected
               </span>

               {selectedContacts.length > 0 && (
                  <button
                     type="button"
                     disabled={confirmDisabled}
                     onClick={() => setSelectedContacts([])}
                  >
                     Clear Selection
                  </button>
               )}
            </div>

            <div className={styles.contactList}>
               {filteredContacts.length === 0 && (
                  <div className={styles.emptyState}>
                     <h3>No contacts found</h3>

                     <p>
                        Try changing your search.
                     </p>
                  </div>
               )}

               {filteredContacts.map((contact) => {
                  const selected = isSelected(contact.id);

                  return (
                     <label
                        key={contact.id}
                        className={`${styles.contact} ${
                           selected ? styles.selected : ""
                        }`}
                     >
                        <input
                           type="checkbox"
                           checked={selected}
                           onChange={() => handleToggle(contact)}
                           disabled={confirmDisabled}
                        />

                        <span className={styles.avatar}>
                           {(contact.firstName || contact.email || "").charAt(0)}
                           {(contact.lastName || "").charAt(0)}
                        </span>

                        <span className={styles.info}>
                           <strong>
                              {`${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "No name provided"}
                           </strong>

                           <span>
                              {contact.email}
                           </span>
                        </span>
                     </label>
                  );
               })}
            </div>

            <div className={styles.actions}>
               <button
                  type="button"
                  className={styles.cancelButton}
                  disabled={confirmDisabled}
                  onClick={onClose}
               >
                  Cancel
               </button>

               <button
                  type="button"
                  className={styles.confirmButton}
                  onClick={handleConfirm}
                  disabled={confirmDisabled}
               >
                  {confirmDisabled
                     ? confirmLoadingLabel
                     : `Use ${selectedContacts.length} Contacts`}
               </button>
            </div>
         </div>
      </div>
   );
}

export default ContactSelector;
