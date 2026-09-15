import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Navbar from "../../components/layout/Navbar/Navbar";
import styles from "./dashboardLayout.module.css";

function DashboardLayout({ children })
{
   const [sidebarOpen, setSidebarOpen] = useState(false);

   return (
      <div className={styles.layout}>
         <Sidebar
            isOpen={sidebarOpen}
            onNavigate={() => setSidebarOpen(false)}
         />

         {sidebarOpen && (
            <button
               aria-label="Close navigation"
               className={styles.mobileOverlay}
               onClick={() => setSidebarOpen(false)}
               type="button"
            />
         )}

         <div className={styles.main}>
         <Navbar onMenuToggle={() => setSidebarOpen(current => !current)} />

         <main className={styles.content}>
            {children}
         </main>
         </div>
      </div>
   );
}

export default DashboardLayout;
