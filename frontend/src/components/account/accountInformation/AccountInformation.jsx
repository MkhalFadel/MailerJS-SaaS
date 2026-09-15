import styles from "./accountInformation.module.css";

function formatDate(value, options)
{
   if(!value)
      return "Unavailable";

   const date = new Date(value);

   if(Number.isNaN(date.getTime()))
      return "Unavailable";

   return new Intl.DateTimeFormat(undefined, options).format(date);
}

function AccountInformation({ user }) {
   const memberSince = formatDate(user?.created_at, {
      month: "long",
      year: "numeric"
   });
   const lastUpdated = formatDate(user?.updated_at, {
      dateStyle: "medium"
   });

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
                  {user?.id || "Unavailable"}
               </strong>
            </div>

            <div className={styles.item}>
               <span>Member Since</span>

               <strong>
                  {memberSince}
               </strong>
            </div>

            <div className={styles.item}>
               <span>Last Updated</span>

               <strong>
                  {lastUpdated}
               </strong>
            </div>

            <div className={styles.item}>
               <span>Account Status</span>

               <strong className={styles.active}>
                  <i></i>
                  {user ? "Active" : "Unavailable"}
               </strong>
            </div>
         </div>
      </section>
   );
}

export default AccountInformation;
