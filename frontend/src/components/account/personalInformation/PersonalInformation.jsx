import { useState } from "react";
import styles from "./personalInformation.module.css";

function PersonalInformation({
   firstName,
   lastName,
   email,
   setFirstName,
   setLastName,
   setEmail,
   onSave
}) {
   const [saved,setSaved] = useState(false);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState(null);

   async function handleSubmit(event) {
      event.preventDefault();

      setSaving(true);
      setSaved(false);
      setError(null);

      try {
         if(onSave)
         {
            await onSave({
               firstName: firstName.trim(),
               lastName: lastName.trim(),
               email: email.trim()
            });
         }

         setSaved(true);
      } catch(error) {
         console.error("Failed to update personal information:", error);
         setError(error.message || "Unable to save personal information.");
      } finally {
         setSaving(false);
      }

   }

   return (
      <section className={styles.container}>
         <div className={styles.header}>
            <h2>Personal Information</h2>

            <p>
               Update the personal information associated with your account.
            </p>
         </div>

         <form
            className={styles.form}
            onSubmit={handleSubmit}
         >
            <div className={styles.fieldRow}>
               <label className={styles.field}>
                  <span>First Name</span>

                  <input
                     type="text"
                     value={firstName}
                     onChange={(event) => setFirstName(event.target.value)}
                     required
                  />
               </label>

               <label className={styles.field}>
                  <span>Last Name</span>

                  <input
                     type="text"
                     value={lastName}
                     onChange={(event) => setLastName(event.target.value)}
                     required
                  />
               </label>
            </div>

            <label className={styles.field}>
               <span>Email Address</span>

               <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
               />
            </label>

            <div className={styles.actions}>
               {error && (
                  <span className={styles.error} role="alert">
                     {error}
                  </span>
               )}

               {saved && (
                  <span className={styles.success} role="status">
                     Changes saved successfully.
                  </span>
               )}

               <button disabled={saving} type="submit">
                  {saving ? "Saving..." : "Save Changes"}
               </button>
            </div>
         </form>
      </section>
   );
}

export default PersonalInformation;
