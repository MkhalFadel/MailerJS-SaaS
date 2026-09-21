import FeedbackState from "./FeedbackState";
import styles from "./fullPageFeedback.module.css";

function FullPageFeedback({ children })
{
   return (
      <main className={styles.container}>
         <FeedbackState>{children}</FeedbackState>
      </main>
   );
}

export default FullPageFeedback;
