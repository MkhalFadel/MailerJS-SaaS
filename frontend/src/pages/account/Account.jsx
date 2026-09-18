import { useEffect, useState } from "react";
import styles from "./account.module.css";
import ProfileOverview from "../../components/account/profileOverview/ProfileOverview";
import PersonalInformation from "../../components/account/personalInformation/PersonalInformation";
import AccountInformation from "../../components/account/accountInformation/AccountInformation";
import UsageOverview from "../../components/account/usageOverview/UsageOverview";
import CurrentPlan from "../../components/account/currentPlan/CurrentPlan";
import Security from "../../components/account/security/Security";
import AccountActions from "../../components/account/accountActions/AccountActions";
import Icon from "../../components/icons/Icon";
import BackButton from "../../components/navigation/BackButton";
import { useAuth } from "../../context/authContext";
import { getDashboard } from "../../api/dashboard";

function Account() {
   const { user, updateProfile, changePassword } = useAuth();
   const [activeSection,setActiveSection] = useState("profile");

   const [firstName,setFirstName] = useState(user?.first_name || "");
   const [lastName,setLastName] = useState(user?.last_name || "");
   const [email,setEmail] = useState(user?.email || "");
   const [usage, setUsage] = useState(null);
   const [usageLoading, setUsageLoading] = useState(true);
   const [usageError, setUsageError] = useState(null);

   useEffect(() => {
      let isCurrent = true;

      async function loadUsage()
      {
         setUsageLoading(true);
         setUsageError(null);

         try {
            const response = await getDashboard();

            if(isCurrent)
               setUsage(response.data.stats);
         } catch(error) {
            console.error("Failed to load account usage:", error);

            if(isCurrent)
               setUsageError(error.message || "Unable to load account usage.");
         } finally {
            if(isCurrent)
               setUsageLoading(false);
         }
      }

      loadUsage();

      return () => {
         isCurrent = false;
      };
   },[user?.id]);

   async function handleProfileSave(profile)
   {
      const response = await updateProfile(profile);
      const updatedUser = response.data;

      setFirstName(updatedUser.first_name);
      setLastName(updatedUser.last_name);
      setEmail(updatedUser.email);
   }

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
                     onSave={handleProfileSave}
                  />

                  <AccountInformation user={user} />

                  <UsageOverview
                     stats={usage}
                     loading={usageLoading}
                     error={usageError}
                  />

                  <CurrentPlan />
               </div>
            );

         case "security":
            return (
               <Security
                  hasPassword={user?.hasPassword}
                  onPasswordChange={changePassword}
               />
            );

         case "actions":
            return <AccountActions />;

         default:
            return null;
      }
   }

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <div>
               <BackButton to="/dashboard">
                  Back to Dashboard
               </BackButton>
            </div>
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
                  <Icon className={styles.navArrow} name="arrowRight" size={15} />
               </button>

               <button
                  className={`${styles.navItem} ${
                     activeSection === "security" ? styles.active : ""
                  }`}
                  onClick={() => setActiveSection("security")}
               >
                  <span>Security</span>
                  <Icon className={styles.navArrow} name="arrowRight" size={15} />
               </button>

               <button
                  className={`${styles.navItem} ${
                     activeSection === "actions" ? styles.actionsActive : ""
                  }`}
                  onClick={() => setActiveSection("actions")}
               >
                  <span>Account Actions</span>
                  <Icon className={styles.navArrow} name="arrowRight" size={15} />
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
