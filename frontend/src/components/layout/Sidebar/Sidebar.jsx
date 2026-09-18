import { NavLink } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
import Icon from "../../icons/Icon";
import mailerjsFullLogo from "../../../assets/mailerjsFullLogo.png";
import styles from "./sidebar.module.css";

const navigation = [
   {
      label: "Dashboard",
      path: "/dashboard",
      icon: "dashboard",
   },
   {
      label: "Campaigns",
      path: "/campaigns",
      icon: "campaign",
   },
   {
      label: "Templates",
      path: "/templates",
      icon: "template",
   },
   {
      label: "Contacts",
      path: "/contacts",
      icon: "contacts",
},
];

const secondaryNavigation = [
   // {
   //    label: "SMTP",
   //    path: "/smtp",
   //    icon: "⚙",
   // },
   {
      label: "Settings",
      path: "/settings",
      icon: "settings",
   },
];

function getInitials(user)
{
   const firstName = user?.first_name || user?.firstName || "";
   const lastName = user?.last_name || user?.lastName || "";

   return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "MJ";
}

function Sidebar({ isOpen, onNavigate }) {
   const { user } = useAuth();
   const firstName = user?.first_name || user?.firstName || "";
   const lastName = user?.last_name || user?.lastName || "";
   const userName = `${firstName} ${lastName}`.trim() || "Account";

   return (
      <aside
         className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
      >
         <div className={styles.logo}>
         <img
            alt="MailerJS"
            className={styles.logoImage}
            src={mailerjsFullLogo}
         />
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
               onClick={onNavigate}
               >
               <Icon className={styles.icon} name={item.icon} size={19} />
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
               onClick={onNavigate}
               >
               <Icon className={styles.icon} name={item.icon} size={19} />
               <span>{item.label}</span>
               </NavLink>
            ))}
         </div>
         </nav>

         <div className={styles.sidebarBottom}>
         <NavLink
            key={"/account"}
            to={"/account"}
            className={styles.user}
            onClick={onNavigate}
         >
            <div className={styles.avatar}>{getInitials(user)}</div>

            <div className={styles.userInfo}>
               <span className={styles.userName}>{userName}</span>
               <span className={styles.userEmail}>{user?.email || ""}</span>
            </div>
         </NavLink>
         </div>
      </aside>
   );
}

export default Sidebar;
