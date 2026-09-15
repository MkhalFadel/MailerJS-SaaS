import { useState } from "react";
import styles from "./security.module.css";
import GoogleSignIn from "../../auth/googleSignIn/GoogleSignIn";
import { verifyGoogleReauthentication } from "../../../api/auth";

function Security({ hasPassword = true, onPasswordChange }) {
   const [currentPassword, setCurrentPassword] = useState("");
   const [newPassword, setNewPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [googleCredential, setGoogleCredential] = useState(null);
   const [googleVerified, setGoogleVerified] = useState(false);
   const [verifyingGoogle, setVerifyingGoogle] = useState(false);
   const [verificationError, setVerificationError] = useState(null);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState(null);
   const [successMessage, setSuccessMessage] = useState(null);
   const isGoogleOnly = !hasPassword;

   function clearGoogleVerification()
   {
      setGoogleCredential(null);
      setGoogleVerified(false);
   }

   async function handleGoogleVerification(credential)
   {
      setVerifyingGoogle(true);
      setVerificationError(null);
      setError(null);
      setSuccessMessage(null);
      clearGoogleVerification();

      try {
         await verifyGoogleReauthentication(credential);

         setGoogleCredential(credential);
         setGoogleVerified(true);
      } catch(error) {
         clearGoogleVerification();
         setVerificationError(
            error.message || "Unable to verify the Google account connected to this MailerJS account."
         );
      } finally {
         setVerifyingGoogle(false);
      }
   }

   async function handleSubmit(event)
   {
      event.preventDefault();
      setError(null);
      setSuccessMessage(null);

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

      if(isGoogleOnly && (!googleVerified || !googleCredential))
      {
         setError("Verify your Google identity before setting a password.");
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
            currentPassword: isGoogleOnly ? undefined : currentPassword,
            newPassword,
            confirmPassword,
            googleCredential: isGoogleOnly ? googleCredential : undefined
         });

         setCurrentPassword("");
         setNewPassword("");
         setConfirmPassword("");
         clearGoogleVerification();
         setSuccessMessage(
            isGoogleOnly
               ? "Password set successfully. You can now sign in with Google or your email and password."
               : "Password changed successfully."
         );
      } catch(error) {
         console.error("Failed to update password:", error);
         setError(error.message || "Unable to change your password.");

         if(isGoogleOnly)
         {
            clearGoogleVerification();
            setVerificationError("Verify your Google identity again before setting a password.");
         }
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
               <h3>{isGoogleOnly ? "Set Password" : "Change Password"}</h3>

               <p>
                  {isGoogleOnly
                     ? "You currently sign in with Google and can create a MailerJS password."
                     : "Change your password regularly to keep your account secure."}
               </p>
            </div>

            <span>
               {isGoogleOnly ? "Google verification required" : "Current password required"}
            </span>
         </div>

         <form className={styles.form} onSubmit={handleSubmit}>
            {hasPassword && (
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
            )}

            {isGoogleOnly && (
               <div className={styles.reauthentication}>
                  <div>
                     <h4>Verify with Google</h4>

                     <p>
                        Confirm the Google identity connected to this account before setting a password.
                     </p>
                  </div>

                  {verifyingGoogle ? (
                     <p className={styles.verifying} role="status">
                        Verifying Google account...
                     </p>
                  ) : googleVerified ? (
                     <p className={styles.verified} role="status">
                        Google account verified. You can now set your password.
                     </p>
                  ) : (
                     <>
                        {verificationError && (
                           <p className={styles.verificationError} role="alert">
                              {verificationError}
                           </p>
                        )}

                        <GoogleSignIn
                           onSuccess={handleGoogleVerification}
                           onError={(googleError) => {
                              clearGoogleVerification();
                              setVerificationError(
                                 googleError.message || "Unable to verify your Google account."
                              );
                           }}
                        />
                     </>
                  )}
               </div>
            )}

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

                  {successMessage && (
                     <span className={styles.success} role="status">
                        {successMessage}
                     </span>
                  )}
               </div>

               <button
                  disabled={saving || (isGoogleOnly && (!googleVerified || !googleCredential || verifyingGoogle))}
                  type="submit"
               >
                  {saving
                     ? (isGoogleOnly ? "Setting Password..." : "Changing...")
                     : (isGoogleOnly ? "Set Password" : "Change Password")}
               </button>
            </div>
         </form>
      </section>
   );
}

export default Security;
