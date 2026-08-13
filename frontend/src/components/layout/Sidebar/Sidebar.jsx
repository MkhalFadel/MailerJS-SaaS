import { NavLink } from "react-router-dom";
import styles from "./sidebar.module.css";

const navigation = [
   {
      label: "Dashboard",
      path: "/dashboard",
      icon: "⌂",
   },
   {
      label: "Campaigns",
      path: "/campaigns",
      icon: "✉",
   },
   {
      label: "Templates",
      path: "/templates",
      icon: "▤",
   },
   {
      label: "Contacts",
      path: "/contacts",
      icon: "♙",
},
];

const secondaryNavigation = [
   {
      label: "SMTP",
      path: "/smtp",
      icon: "⚙",
   },
   {
      label: "Settings",
      path: "/settings",
      icon: "⚙",
   },
];

function Sidebar() {
   return (
      <aside className={styles.sidebar}>
         <div className={styles.logo}>
         <div className={styles.logoMark}>M</div>
         <span>MailerJS</span>
         </div>

         <nav className={styles.navigation}>
         <div className={styles.navigationGroup}>
            <span className={styles.groupTitle}>Workspace</span>

            {navigation.map((item) => (
               <NavLink
               key={item.path}
               to={item.path}
               className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ""}`
               }
               >
               <span className={styles.icon}>{item.icon}</span>
               <span>{item.label}</span>
               </NavLink>
            ))}
         </div>

         <div className={styles.navigationGroup}>
            <span className={styles.groupTitle}>Configuration</span>

            {secondaryNavigation.map((item) => (
               <NavLink
               key={item.path}
               to={item.path}
               className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ""}`
               }
               >
               <span className={styles.icon}>{item.icon}</span>
               <span>{item.label}</span>
               </NavLink>
            ))}
         </div>
         </nav>

         <div className={styles.sidebarBottom}>
         <div className={styles.user}>
            <div className={styles.avatar}>FM</div>

            <div className={styles.userInfo}>
               <span className={styles.userName}>Fadel Mkahal</span>
               <span className={styles.userEmail}>fadel@example.com</span>
            </div>
         </div>
         </div>
      </aside>
   );
}

export default Sidebar;