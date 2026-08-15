import { useState } from "react";
import styles from "./dangerZone.module.css";
import { useNavigate } from "react-router-dom";

function DangerZone() {
   const [showConfirmation,setShowConfirmation] = useState(false);
   const [action, setAction] = useState("");

   const navigate = useNavigate();

   function signout()
   {
      navigate("/login")
   }

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
                     Sign Out
                  </h3>

                  <p>
                     Sign out of your Account
                  </p>
               </div>

               <button
                  className={styles.deleteButton}
                  onClick={() => {
                     setShowConfirmation(true)
                     setAction("signOut")
                  }}
               >
                  Sign Out
               </button>
            </div>

            {(showConfirmation && action === 'signOut') && (
               <div className={styles.confirmation}>
                  <div>
                     <h3>
                        Are you sure?
                     </h3>
                  </div>

                  <div className={styles.confirmationActions}>
                     <button
                        className={styles.cancelButton}
                        onClick={() => setShowConfirmation(false)}
                     >
                        Cancel
                     </button>

                     <button className={styles.confirmButton} onClick={signout}>
                        Yes, Sign out
                     </button>
                  </div>
               </div>
            )}
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
                  onClick={() => {
                     setShowConfirmation(true)
                     setAction("delete")
                  }}
               >
                  Delete Account
               </button>
            </div>

            {(showConfirmation && action === "delete") && (
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