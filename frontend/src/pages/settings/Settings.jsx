import { useState } from "react";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import EmailConfiguration from "../../components/settings/emailConfiguration/EmailConfiguration";
import SenderSettings from "../../components/settings/senderSettings/SenderSettings";
import styles from "./settings.module.css";

function Settings() {
   const [activeSection,setActiveSection] = useState("email");

   return (
      <DashboardLayout>
         <div className={styles.page}>
            <div className={styles.header}>
               <h1>Settings</h1>

               <p>
                  Manage your email configuration and sending preferences.
               </p>
            </div>

            <div className={styles.layout}>
               <aside className={styles.sidebar}>
                  <button
                     className={`${styles.navItem} ${
                        activeSection === "email"
                           ? styles.active
                           : ""
                     }`}
                     onClick={() => setActiveSection("email")}
                  >
                     <span>✉</span>
                     Email Configuration
                  </button>

                  <button
                     className={`${styles.navItem} ${
                        activeSection === "sender"
                           ? styles.active
                           : ""
                     }`}
                     onClick={() => setActiveSection("sender")}
                  >
                     <span>◎</span>
                     Sender Settings
                  </button>
               </aside>

               <main className={styles.content}>
                  {activeSection === "email" && (
                     <EmailConfiguration />
                  )}

                  {activeSection === "sender" && (
                     <SenderSettings />
                  )}
               </main>
            </div>
         </div>
      </DashboardLayout>
   );
}

export default Settings;