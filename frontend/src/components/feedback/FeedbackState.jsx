import Icon from "../icons/Icon";
import styles from "./feedbackState.module.css";

function FeedbackState({ children, feedbackRef, type = "loading" })
{
   const iconName = type === "success"
      ? "check"
      : type === "error" || type === "warning"
         ? "alert"
         : "campaign";
   const isError = type === "error";

   return (
      <div
         className={`${styles.state} ${styles[type] || ""}`}
         aria-live={isError ? "assertive" : "polite"}
         ref={feedbackRef}
         role={isError ? "alert" : "status"}
         tabIndex="-1"
      >
         <span className={styles.icon}>
            {type === "loading"
               ? <span className={styles.spinner} aria-hidden="true" />
               : <Icon name={iconName} size={18} />}
         </span>

         <span>{children}</span>
      </div>
   );
}

export default FeedbackState;
