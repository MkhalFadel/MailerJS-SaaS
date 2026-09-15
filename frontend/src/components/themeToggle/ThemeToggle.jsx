import { useTheme } from "../../context/themeContext";
import Icon from "../icons/Icon";
import styles from "./themeToggle.module.css";

function ThemeToggle() {
   const { theme, toggleTheme } = useTheme();

   const isDark = theme === "dark";

   return (
      <button
         className={styles.toggle}
         onClick={toggleTheme}
         aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
         title={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
         <span
            className={`${styles.icon} ${
               isDark ? styles.active : ""
            }`}
         >
            <Icon name="moon" size={15} />
         </span>

         <span
            className={`${styles.icon} ${
               !isDark ? styles.active : ""
            }`}
         >
            <Icon name="sun" size={15} />
         </span>
      </button>
   );
}

export default ThemeToggle;
