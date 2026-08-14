import styles from "./security.module.css";

function Security() {
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
               Never changed
            </span>
         </div>

         <form className={styles.form}>
            <label className={styles.field}>
               <span>Current Password</span>

               <input
                  type="password"
                  placeholder="Enter current password"
               />
            </label>

            <label className={styles.field}>
               <span>New Password</span>

               <input
                  type="password"
                  placeholder="Enter new password"
               />
            </label>

            <label className={styles.field}>
               <span>Confirm New Password</span>

               <input
                  type="password"
                  placeholder="Confirm new password"
               />
            </label>

            <div className={styles.requirements}>
               <span>Password requirements</span>

               <p>• At least 8 characters</p>
               <p>• Contains uppercase and lowercase letters</p>
               <p>• Contains at least one number</p>
            </div>

            <div className={styles.actions}>
               <button type="submit">
                  Change Password
               </button>
            </div>
         </form>
      </section>
   );
}

export default Security;