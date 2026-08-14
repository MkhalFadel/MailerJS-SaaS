import { useState } from "react";
import styles from "./dangerZone.module.css";

function DangerZone() {
   const [showConfirmation,setShowConfirmation] = useState(false);

   return (
      <section className={styles.container}>
         <div className={styles.header}>
            <h2>Danger Zone</h2>

            <p>
               Irreversible actions affecting your account.
            </p>
         </div>

         <div className={styles.dangerCard}>
            <div className={styles.content}>
               <div>
                  <h3>
                     Delete Account
                  </h3>

                  <p>
                     Permanently delete your account and all associated data.
                     This action cannot be undone.
                  </p>
               </div>

               <button
                  className={styles.deleteButton}
                  onClick={() => setShowConfirmation(true)}
               >
                  Delete Account
               </button>
            </div>

            {showConfirmation && (
               <div className={styles.confirmation}>
                  <div>
                     <h3>
                        Are you sure?
                     </h3>

                     <p>
                        Your campaigns, templates, contacts, and account data
                        will be permanently deleted.
                     </p>
                  </div>

                  <div className={styles.confirmationActions}>
                     <button
                        className={styles.cancelButton}
                        onClick={() => setShowConfirmation(false)}
                     >
                        Cancel
                     </button>

                     <button className={styles.confirmButton}>
                        Yes, Delete My Account
                     </button>
                  </div>
               </div>
            )}
         </div>
      </section>
   );
}

export default DangerZone;