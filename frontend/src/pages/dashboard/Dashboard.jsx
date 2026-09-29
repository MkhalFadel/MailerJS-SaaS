import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import DashboardStats from "../../components/dashboard/dashboardStats/DashboardStats";
import RecentCampaigns from "../../components/dashboard/recentCampaigns/RecentCampaigns";
import DashboardOverview from "../../components/dashboard/dashboardOverview/DashboardOverview";
import BrandLoader from "../../components/feedback/BrandLoader";
import FeedbackState from "../../components/feedback/FeedbackState";
import { getDashboard } from "../../api/dashboard";
import styles from "./dashboard.module.css";

function Dashboard()
{
   const [dashboard, setDashboard] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      async function loadDashboard()
      {
         try {
            const response = await getDashboard();

            setDashboard(response.data);
         } catch(error) {
            console.error("Failed to fetch dashboard:", error);
            setError(error.message || "Unable to load dashboard.");
         } finally {
            setLoading(false);
         }
      }

      loadDashboard();
   },[]);

   return (
      <DashboardLayout>
         <div className={styles.page}>
            <div className={styles.header}>
               <div>
                  <h1>Dashboard</h1>

                  <p>
                     Overview of your email campaign activity.
                  </p>
               </div>
            </div>

            {loading && (
               <section className={styles.pageLoader}>
                  <BrandLoader label="Loading dashboard..." size="lg" />
               </section>
            )}

            {!loading && error && (
               <FeedbackState type="error">
                  {error}
               </FeedbackState>
            )}

            {!loading && !error && dashboard && (
               <>
                  <DashboardStats stats={dashboard.stats} />

                  <section className={styles.workspace}>
                     <div className={styles.recentPanel}>
                        <RecentCampaigns
                           campaigns={dashboard.recentCampaigns}
                        />
                     </div>

                     <aside className={styles.summaryPanel}>
                        <DashboardOverview stats={dashboard.stats} />
                     </aside>
                  </section>
               </>
            )}
         </div>
      </DashboardLayout>
   );
}

export default Dashboard;
