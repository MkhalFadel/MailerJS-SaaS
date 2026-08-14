import styles from "./billingHistory.module.css";

function BillingHistory() {
   const transactions = [
      {
         date: "Aug 01, 2026",
         description: "Pro Subscription",
         amount: "$15.00",
         status: "Paid"
      },
      {
         date: "Jul 01, 2026",
         description: "Pro Subscription",
         amount: "$15.00",
         status: "Paid"
      },
      {
         date: "Jun 01, 2026",
         description: "Pro Subscription",
         amount: "$15.00",
         status: "Paid"
      },
      {
         date: "May 01, 2026",
         description: "Pro Subscription",
         amount: "$15.00",
         status: "Paid"
      }
   ];

   return (
      <section className={styles.container}>
         <div className={styles.header}>
            <div>
               <h2>Billing History</h2>

               <p>
                  View your previous payments and invoices.
               </p>
            </div>

            <button>
               Download All
            </button>
         </div>

         <div className={styles.tableWrapper}>
            <table>
               <thead>
                  <tr>
                     <th>Date</th>
                     <th>Description</th>
                     <th>Amount</th>
                     <th>Status</th>
                     <th></th>
                  </tr>
               </thead>

               <tbody>
                  {transactions.map((transaction) => (
                     <tr key={`${transaction.date}-${transaction.description}`}>
                        <td>{transaction.date}</td>

                        <td>{transaction.description}</td>

                        <td>{transaction.amount}</td>

                        <td>
                           <span className={styles.status}>
                              {transaction.status}
                           </span>
                        </td>

                        <td>
                           <button className={styles.invoiceButton}>
                              Invoice
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </section>
   );
}

export default BillingHistory;