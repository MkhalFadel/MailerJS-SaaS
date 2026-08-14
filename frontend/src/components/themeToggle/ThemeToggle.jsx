import { useTheme } from "../../context/ThemeContext";
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
            ☾
         </span>

         <span
            className={`${styles.icon} ${
               !isDark ? styles.active : ""
            }`}
         >
            ☀
         </span>
      </button>
   );
}

export default ThemeToggle;