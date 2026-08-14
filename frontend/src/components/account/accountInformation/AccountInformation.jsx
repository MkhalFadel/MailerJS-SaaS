import styles from "./accountInformation.module.css";

function AccountInformation() {
   return (
      <section className={styles.container}>
         <div className={styles.header}>
            <h2>Account Information</h2>

            <p>
               General information about your account.
            </p>
         </div>

         <div className={styles.grid}>
            <div className={styles.item}>
               <span>Account ID</span>

               <strong>
                  #USR-8F29A1
               </strong>
            </div>

            <div className={styles.item}>
               <span>Member Since</span>

               <strong>
                  August 2026
               </strong>
            </div>

            <div className={styles.item}>
               <span>Last Login</span>

               <strong>
                  Today
               </strong>
            </div>

            <div className={styles.item}>
               <span>Account Status</span>

               <strong className={styles.active}>
                  <i></i>
                  Active
               </strong>
            </div>
         </div>
      </section>
   );
}

export default AccountInformation;