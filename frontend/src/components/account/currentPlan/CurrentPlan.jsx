import styles from "./currentPlan.module.css";

function CurrentPlan() {
   return (
      <section className={styles.container}>
         <div className={styles.header}>
            <h2>Current Plan</h2>

            <p>
               Manage your current subscription plan.
            </p>
         </div>

         <div className={styles.content}>
            <div>
               <span className={styles.label}>
                  Current Plan
               </span>

               <h3>
                  Free
               </h3>

               <p>
                  Perfect for getting started with MailerJS.
               </p>
            </div>

            <button>
               View Plans
            </button>
         </div>
      </section>
   );
}

export default CurrentPlan;