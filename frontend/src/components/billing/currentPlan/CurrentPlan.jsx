import styles from "./currentPlan.module.css";

function CurrentPlan({ setActiveSection }) {
   return (
      <section className={styles.container}>
         <div className={styles.header}>
            <div>
               <span className={styles.eyebrow}>
                  Current Subscription
               </span>

               <h2>Free</h2>

               <p>
                  You're currently using the free MailerJS plan.
               </p>
            </div>

            <span className={styles.badge}>
               Current Plan
            </span>
         </div>

         <div className={styles.details}>
            <div className={styles.price}>
               <strong>$0</strong>
               <span>/ month</span>
            </div>

            <div className={styles.info}>
               <span>Billing Period</span>
               <strong>Monthly</strong>
            </div>

            <div className={styles.info}>
               <span>Next Billing Date</span>
               <strong>No upcoming payment</strong>
            </div>
         </div>

         <div className={styles.footer}>
            <div>
               <span>Need more?</span>

               <p>
                  Upgrade your plan to unlock higher limits and more features.
               </p>
            </div>

            <button onClick={() => setActiveSection("plans")}>
               View Plans
            </button>
         </div>
      </section>
   );
}

export default CurrentPlan;