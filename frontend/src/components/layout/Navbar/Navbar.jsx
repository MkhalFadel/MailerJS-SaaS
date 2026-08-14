import styles from "./navbar.module.css";
import ThemeToggle from "../../themeToggle/ThemeToggle";

function Navbar() {
   return (
      <header className={styles.navbar}>
         <div>
         <button className={styles.mobileMenu}>☰</button>
         </div>


         <div className={styles.actions}>
         <ThemeToggle />
         <button className={styles.iconButton} aria-label="Notifications">
            🔔
         </button>

         <button className={styles.profile}>
            <span className={styles.avatar}>FM</span>

            <span className={styles.profileName}>Fadel</span>

            <span className={styles.chevron}>⌄</span>
         </button>
         </div>
      </header>
   );
}

export default Navbar;