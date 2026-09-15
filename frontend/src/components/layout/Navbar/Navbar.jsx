import styles from "./navbar.module.css";
import ThemeToggle from "../../themeToggle/ThemeToggle";
import { useAuth } from "../../../context/authContext";
import Icon from "../../icons/Icon";

function Navbar({ onMenuToggle }) {
   const { user } = useAuth();
   const firstName = user?.first_name || user?.firstName || "";
   const lastName = user?.last_name || user?.lastName || "";
   const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "MJ";

   return (
      <header className={styles.navbar}>
         <div>
         <button
            aria-label="Toggle navigation"
            className={styles.mobileMenu}
            onClick={onMenuToggle}
            type="button"
         >
            <Icon name="menu" size={22} />
         </button>
         </div>


         <div className={styles.actions}>
         <ThemeToggle />
         <button className={styles.iconButton} aria-label="Notifications" type="button">
            <Icon name="bell" size={19} />
         </button>

         <button className={styles.profile} type="button">
            <span className={styles.avatar}>{initials}</span>

            <span className={styles.profileName}>{firstName || "Account"}</span>

            <Icon className={styles.chevron} name="chevronDown" size={16} />
         </button>
         </div>
      </header>
   );
}

export default Navbar;
