import Icon from "../icons/Icon";
import styles from "./feedbackState.module.css";

function FeedbackState({ children, type = "loading" })
{
   const isError = type === "error";

   return (
      <div
         className={`${styles.state} ${isError ? styles.error : ""}`}
         role={isError ? "alert" : "status"}
      >
         <span className={styles.icon}>
            <Icon name={isError ? "alert" : "campaign"} size={18} />
         </span>

         <span>{children}</span>
      </div>
   );
}

export default FeedbackState;
