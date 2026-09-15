import { useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./billing.module.css";
import CurrentPlan from "../../components/billing/currentPlan/CurrentPlan";
import Usage from "../../components/billing/usage/Usage";
import Plans from "../../components/billing/plans/Plans";
import BillingHistory from "../../components/billing/billingHistory/BillingHistory";
import Icon from "../../components/icons/Icon";

function Billing() {
   const [activeSection, setActiveSection] = useState("overview");

   function renderContent() {
      switch (activeSection) {
         case "overview":
            return (
               <div className={styles.overviewContent}>
                  <CurrentPlan setActiveSection={setActiveSection} />
                  <Usage />
               </div>
            );

         case "plans":
            return <Plans />;

         case "history":
            return <BillingHistory />;

         default:
            return null;
      }
   }

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <div>
               <NavLink key={"/account"} to={"/account"} className={styles.backBtn}>
                  <Icon name="arrowLeft" size={16} />
                  Back to Account Settings
               </NavLink>
            </div>
            <div>
               <h1>Billing</h1>

               <p>
                  Manage your subscription, usage, and billing information.
               </p>
            </div>
         </div>

         <div className={styles.layout}>
            <aside className={styles.sidebar}>
               <button
                  className={`${styles.navItem} ${
                     activeSection === "overview" ? styles.active : ""
                  }`}
                  onClick={() => setActiveSection("overview")}
               >
                  <span>Overview</span>
                  <Icon className={styles.navArrow} name="arrowRight" size={15} />
               </button>

               <button
                  className={`${styles.navItem} ${
                     activeSection === "plans" ? styles.active : ""
                  }`}
                  onClick={() => setActiveSection("plans")}
               >
                  <span>Plans</span>
                  <Icon className={styles.navArrow} name="arrowRight" size={15} />
               </button>

               <button
                  className={`${styles.navItem} ${
                     activeSection === "history" ? styles.active : ""
                  }`}
                  onClick={() => setActiveSection("history")}
               >
                  <span>Billing History</span>
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

export default Billing;
