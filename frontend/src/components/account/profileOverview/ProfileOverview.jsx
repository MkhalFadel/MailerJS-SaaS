import styles from "./profileOverview.module.css";
import Icon from "../../icons/Icon";

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
                  <Icon name="check" size={12} />
               </span>

               Email verified
            </div>
         </div>
      </section>
   );
}

export default ProfileOverview;
