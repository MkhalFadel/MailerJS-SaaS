import styles from "./usage.module.css";

function Usage() {
   const usage = [
      {
         name: "Emails",
         used: 1248,
         limit: 5000
      },
      {
         name: "Campaigns",
         used: 24,
         limit: 50
      },
      {
         name: "Contacts",
         used: 463,
         limit: 1000
      },
      {
         name: "Templates",
         used: 8,
         limit: 25
      }
   ];

   return (
      <section className={styles.container}>
         <div className={styles.header}>
            <div>
               <h2>Usage</h2>

               <p>
                  Monitor your usage for the current billing period.
               </p>
            </div>

            <span>
               Current Period
            </span>
         </div>

         <div className={styles.list}>
            {usage.map((item) => {
               const percentage = Math.min(
                  Math.round((item.used / item.limit) * 100),
                  100
               );

               return (
                  <div
                     className={styles.item}
                     key={item.name}
                  >
                     <div className={styles.itemHeader}>
                        <span>{item.name}</span>

                        <strong>
                           {item.used.toLocaleString()} / {item.limit.toLocaleString()}
                        </strong>
                     </div>

                     <div className={styles.track}>
                        <div
                           className={styles.bar}
                           style={{
                              width: `${percentage}%`
                           }}
                        />
                     </div>

                     <span className={styles.percentage}>
                        {percentage}% used
                     </span>
                  </div>
               );
            })}
         </div>
      </section>
   );
}

export default Usage;