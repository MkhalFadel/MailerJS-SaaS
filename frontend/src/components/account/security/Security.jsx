import { useState } from "react";
import styles from "./security.module.css";

function Security({ onPasswordChange }) {
   const [currentPassword, setCurrentPassword] = useState("");
   const [newPassword, setNewPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState(null);
   const [success, setSuccess] = useState(false);

   async function handleSubmit(event)
   {
      event.preventDefault();
      setError(null);
      setSuccess(false);

      if(newPassword.length < 8)
      {
         setError("Your new password must contain at least 8 characters.");
         return;
      }

      if(!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword))
      {
         setError("Your new password must include uppercase, lowercase, and a number.");
         return;
      }

      if(newPassword !== confirmPassword)
      {
         setError("Your new password and confirmation do not match.");
         return;
      }

      if(!onPasswordChange)
      {
         setError("Password updates are unavailable right now.");
         return;
      }

      setSaving(true);

      try {
         await onPasswordChange({
            currentPassword,
            password: newPassword
         });

         setCurrentPassword("");
         setNewPassword("");
         setConfirmPassword("");
         setSuccess(true);
      } catch(error) {
         console.error("Failed to update password:", error);
         setError(error.message || "Unable to change your password.");
      } finally {
         setSaving(false);
      }
   }

   return (
      <section className={styles.container}>
         <div className={styles.header}>
            <h2>Security</h2>

            <p>
               Manage your password and account security.
            </p>
         </div>

         <div className={styles.passwordStatus}>
            <div>
               <h3>Password</h3>

               <p>
                  Change your password regularly to keep your account secure.
               </p>
            </div>

            <span>
               Current password required
            </span>
         </div>

         <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
               <span>Current Password</span>

               <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  required
               />
            </label>

            <label className={styles.field}>
               <span>New Password</span>

               <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  required
               />
            </label>

            <label className={styles.field}>
               <span>Confirm New Password</span>

               <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  required
               />
            </label>

            <div className={styles.requirements}>
               <span>Password requirements</span>

               <p>• At least 8 characters</p>
               <p>• Contains uppercase and lowercase letters</p>
               <p>• Contains at least one number</p>
            </div>

            <div className={styles.actions}>
               <div className={styles.feedback}>
                  {error && (
                     <span className={styles.error} role="alert">
                        {error}
                     </span>
                  )}

                  {success && (
                     <span className={styles.success} role="status">
                        Password changed successfully.
                     </span>
                  )}
               </div>

               <button disabled={saving} type="submit">
                  {saving ? "Changing..." : "Change Password"}
               </button>
            </div>
         </form>
      </section>
   );
}

export default Security;
