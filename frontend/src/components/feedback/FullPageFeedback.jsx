import BrandLoader from "./BrandLoader";
import styles from "./fullPageFeedback.module.css";

function FullPageFeedback({ children })
{
   return (
      <main className={styles.container}>
         <BrandLoader label={children} size="lg" />
      </main>
   );
}

export default FullPageFeedback;
