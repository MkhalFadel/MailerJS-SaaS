import styles from "./contactDetails.module.css";

function ContactDetails({ contact, onBack, onEdit }) {
   const initials = `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`;

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <button
                  className={styles.backButton}
                  onClick={onBack}
               >
                  ← Back to Contacts
               </button>

               <div className={styles.profile}>
                  <div className={styles.avatar}>
                     {initials}
                  </div>

                  <div>
                     <h1>
                        {contact.firstName} {contact.lastName}
                     </h1>

                     <p>
                        {contact.email}
                     </p>
                  </div>
               </div>
            </div>

            <button
               className={styles.editButton}
               onClick={onEdit}
            >
               Edit Contact
            </button>
         </div>

         <div className={styles.grid}>
            <section className={styles.card}>
               <div className={styles.cardHeader}>
                  <h2>Contact Information</h2>
               </div>

               <div className={styles.details}>
                  <div>
                     <span>First Name</span>
                     <strong>{contact.firstName}</strong>
                  </div>

                  <div>
                     <span>Last Name</span>
                     <strong>{contact.lastName}</strong>
                  </div>

                  <div>
                     <span>Email</span>
                     <strong>{contact.email}</strong>
                  </div>
                  
               </div>
            </section>

            <section className={styles.card}>
               <div className={styles.cardHeader}>
                  <h2>Contact Activity</h2>
               </div>

               <div className={styles.activity}>
                  <div>
                     <span>Last campaign</span>
                     <small>Not available</small>
                  </div>
               </div>
            </section>
         </div>
      </div>
   );
}

export default ContactDetails;