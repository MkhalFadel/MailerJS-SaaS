import { useState } from "react";
import styles from "./personalInformation.module.css";

function PersonalInformation({
   firstName,
   lastName,
   email,
   setFirstName,
   setLastName,
   setEmail
}) {
   const [saved,setSaved] = useState(false);

   function handleSubmit(event) {
      event.preventDefault();

      setSaved(true);

      setTimeout(() => {
         setSaved(false);
      },3000);
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
               {saved && (
                  <span>
                     Changes saved successfully.
                  </span>
               )}

               <button type="submit">
                  Save Changes
               </button>
            </div>
         </form>
      </section>
   );
}

export default PersonalInformation;