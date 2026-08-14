import { useState } from "react";
import styles from "./account.module.css";
import ProfileOverview from "../../components/account/profileOverview/ProfileOverview";
import PersonalInformation from "../../components/account/personalInformation/PersonalInformation";
import AccountInformation from "../../components/account/accountInformation/AccountInformation";
import UsageOverview from "../../components/account/usageOverview/UsageOverview";
import CurrentPlan from "../../components/account/currentPlan/CurrentPlan";
import Security from "../../components/account/security/Security";
import DangerZone from "../../components/account/dangerZone/DangerZone";

function Account() {
   const [activeSection,setActiveSection] = useState("profile");

   const [firstName,setFirstName] = useState("Fadel");
   const [lastName,setLastName] = useState("Mkahal");
   const [email,setEmail] = useState("fadel@example.com");

   function renderContent() {
      switch (activeSection) {
         case "profile":
            return (
               <div className={styles.profileContent}>
                  <ProfileOverview
                     firstName={firstName}
                     lastName={lastName}
                     email={email}
                  />

                  <PersonalInformation
                     firstName={firstName}
                     lastName={lastName}
                     email={email}
                     setFirstName={setFirstName}
                     setLastName={setLastName}
                     setEmail={setEmail}
                  />

                  <AccountInformation />

                  <UsageOverview />

                  <CurrentPlan />
               </div>
            );

         case "security":
            return <Security />;

         case "danger":
            return <DangerZone />;

         default:
            return null;
      }
   }

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <div>
               <h1>Account Settings</h1>

               <p>
                  Manage your profile, security, and account preferences.
               </p>
            </div>
         </div>

         <div className={styles.layout}>
            <aside className={styles.sidebar}>
               <button
                  className={`${styles.navItem} ${
                     activeSection === "profile" ? styles.active : ""
                  }`}
                  onClick={() => setActiveSection("profile")}
               >
                  <span>Profile</span>
                  <span>›</span>
               </button>

               <button
                  className={`${styles.navItem} ${
                     activeSection === "security" ? styles.active : ""
                  }`}
                  onClick={() => setActiveSection("security")}
               >
                  <span>Security</span>
                  <span>›</span>
               </button>

               <button
                  className={`${styles.navItem} ${
                     activeSection === "danger" ? styles.dangerActive : ""
                  }`}
                  onClick={() => setActiveSection("danger")}
               >
                  <span>Danger Zone</span>
                  <span>›</span>
               </button>
            </aside>

            <main className={styles.content}>
               {renderContent()}
            </main>
         </div>
      </div>
   );
}

export default Account;