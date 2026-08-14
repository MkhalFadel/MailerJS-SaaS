import styles from "./profileOverview.module.css";

function ProfileOverview({ firstName, lastName, email }) 
{
   return (
      <section className={styles.container}>
         <div className={styles.avatar}>
            {firstName.charAt(0)}
         </div>

         <div className={styles.details}>
            <div>
               <h2>
                  {firstName} {lastName}
               </h2>

               <p>
                  {email}
               </p>
            </div>

            <div className={styles.verification}>
               <span>
                  ✓
               </span>

               Email verified
            </div>
         </div>

         <button className={styles.avatarButton}>
            Change Avatar
         </button>
      </section>
   );
}

export default ProfileOverview;