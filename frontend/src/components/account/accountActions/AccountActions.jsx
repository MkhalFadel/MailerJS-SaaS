import { useState } from "react";
import styles from "./accountActions.module.css";
import { useNavigate } from "react-router-dom";
import { deleteUser } from "../../../api/auth";
import { useAuth } from "../../../context/authContext";
import useFeedbackScroll from "../../../hooks/useFeedbackScroll";

function AccountActions() {
   const [showConfirmation,setShowConfirmation] = useState(false);
   const [action, setAction] = useState("");
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(false);
   const { feedbackRef, requestFeedbackScroll } = useFeedbackScroll(error);

   const navigate = useNavigate();
   const { logout } = useAuth();

   async function signout()
   {
      setLoading(true);
      setError(null);

      try {
         await logout();
         navigate("/login");
      } catch (error) {
         console.error("Failed to sign out:", error);
         requestFeedbackScroll();
         setError(error.message || "Unable to sign out.");
      } finally {
         setLoading(false);
      }
   }

   async function deleteAccount()
   {
      setLoading(true);
      setError(null);

      try {
         await deleteUser();
         await logout();
         navigate('/login');
      } catch (error) {
         console.error("Failed to delete account:", error);
         requestFeedbackScroll();
         setError(error.message || "Unable to delete your account.");
      } finally {
         setLoading(false);
      }
   }

   return (
      <section className={styles.container}>
         <div className={styles.header}>
            <h2>Account Actions</h2>

            <p>
               Manage your active session or permanently remove your account.
            </p>
         </div>

         {error && (
            <p
               className={styles.error}
               ref={feedbackRef}
               role="alert"
               tabIndex="-1"
            >
               {error}
            </p>
         )}

         <div className={styles.actionCard}>
            <div className={styles.content}>
               <div>
                  <h3>
                     Sign Out
                  </h3>

                  <p>
                     Sign out of your account on this device.
                  </p>
               </div>

               <button
                  type="button"
                  className={styles.signOutButton}
                  disabled={loading}
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
                        type="button"
                        className={styles.cancelButton}
                        disabled={loading}
                        onClick={() => setShowConfirmation(false)}
                     >
                        Cancel
                     </button>

                     <button
                        type="button"
                        className={styles.confirmButton}
                        disabled={loading}
                        onClick={signout}
                     >
                        {loading ? "Signing Out..." : "Yes, Sign Out"}
                     </button>
                  </div>
               </div>
            )}
         </div>
         <div className={`${styles.actionCard} ${styles.destructive}`}>
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
                  type="button"
                  className={styles.deleteButton}
                  disabled={loading}
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
                        type="button"
                        className={styles.cancelButton}
                        disabled={loading}
                        onClick={() => setShowConfirmation(false)}
                     >
                        Cancel
                     </button>

                     <button
                        type="button"
                        className={styles.confirmButton}
                        disabled={loading}
                        onClick={deleteAccount}
                     >
                        {loading ? "Deleting..." : "Yes, Delete My Account"}
                     </button>
                  </div>
               </div>
            )}
         </div>
      </section>
   );
}

export default AccountActions;
