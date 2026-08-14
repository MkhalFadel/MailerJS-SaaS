import styles from "./plans.module.css";

function Plans() {
   const plans = [
      {
         name: "Free",
         price: "$0",
         description: "Get started with the essential email tools.",
         features: [
            "5,000 emails per month",
            "10 campaigns",
            "1,000 contacts",
            "25 templates"
         ],
         current: true
      },
      {
         name: "Pro",
         price: "$15",
         description: "For developers and growing projects.",
         features: [
            "50,000 emails per month",
            "Unlimited campaigns",
            "10,000 contacts",
            "Unlimited templates"
         ],
         popular: true
      },
      {
         name: "Business",
         price: "$49",
         description: "For teams with larger email requirements.",
         features: [
            "250,000 emails per month",
            "Unlimited campaigns",
            "Unlimited contacts",
            "Unlimited templates"
         ]
      }
   ];

   return (
      <section className={styles.container}>
         <div className={styles.header}>
            <h2>Plans</h2>

            <p>
               Choose the plan that fits your email needs.
            </p>
         </div>

         <div className={styles.grid}>
            {plans.map((plan) => (
               <article
                  className={`${styles.card} ${
                     plan.popular ? styles.popular : ""
                  }`}
                  key={plan.name}
               >
                  {plan.popular && (
                     <span className={styles.popularBadge}>
                        Most Popular
                     </span>
                  )}

                  <div className={styles.cardHeader}>
                     <h3>{plan.name}</h3>

                     <p>
                        {plan.description}
                     </p>
                  </div>

                  <div className={styles.price}>
                     <strong>{plan.price}</strong>

                     <span>/ month</span>
                  </div>

                  <div className={styles.divider} />

                  <ul>
                     {plan.features.map((feature) => (
                        <li key={feature}>
                           <span>✓</span>
                           {feature}
                        </li>
                     ))}
                  </ul>

                  <button
                     className={plan.current ? styles.currentButton : ""}
                  >
                     {plan.current ? "Current Plan" : "Upgrade"}
                  </button>
               </article>
            ))}
         </div>
      </section>
   );
}

export default Plans;