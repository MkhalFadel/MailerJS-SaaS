import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Navbar from "../../components/layout/Navbar/Navbar";
import styles from "./dashboardLayout.module.css";

function DashboardLayout({ children }) {
   return (
      <div className={styles.layout}>
         <Sidebar />

         <div className={styles.main}>
         <Navbar />

         <main className={styles.content}>
            {children}
         </main>
         </div>
      </div>
   );
}

export default DashboardLayout;