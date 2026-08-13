import { useState } from "react";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import CampaignList from "../../components/campaigns/campaignList/CampaignList";
import CampaignForm from "../../components/campaigns/campaignForm/CampaignForm";
import CampaignDetails from "../../components/campaigns/campaignDetails/CampaignDetails";
import styles from "./campaigns.module.css";

const campaignsData = [
   {
      id: 1,
      name: "Summer Newsletter",
      subject: "Summer deals are here!",
      status: "completed",
      recipients: 1240,
      sent: 1238,
      failed: 2,
      openRate: "74.2%",
      clickRate: "21.4%",
      createdAt: "Aug 10, 2026"
   },
   {
      id: 2,
      name: "Product Update",
      subject: "What's new in MailerJS",
      status: "completed",
      recipients: 320,
      sent: 319,
      failed: 1,
      openRate: "68.5%",
      clickRate: "18.2%",
      createdAt: "Aug 8, 2026"
   },
   {
      id: 3,
      name: "Job Applications",
      subject: "Software Developer Application",
      status: "draft",
      recipients: 42,
      sent: 0,
      failed: 0,
      openRate: "—",
      clickRate: "—",
      createdAt: "Aug 7, 2026"
   },
   {
      id: 4,
      name: "Welcome Email",
      subject: "Welcome to MailerJS",
      status: "scheduled",
      recipients: 850,
      sent: 0,
      failed: 0,
      openRate: "—",
      clickRate: "—",
      createdAt: "Aug 5, 2026"
   }
];

function Campaigns() {
   const [view, setView] = useState("list");
   const [selectedCampaign, setSelectedCampaign] = useState(null);

   function handleCreateCampaign() {
      setSelectedCampaign(null);
      setView("create");
   }

   function handleViewCampaign(campaign) {
      setSelectedCampaign(campaign);
      setView("details");
   }

   function handleBack() {
      setSelectedCampaign(null);
      setView("list");
   }

   return (
      <DashboardLayout>
         <div className={styles.page}>
            {view === "list" && (
               <CampaignList
                  campaigns={campaignsData}
                  onCreate={handleCreateCampaign}
                  onView={handleViewCampaign}
               />
            )}

            {view === "create" && (
               <CampaignForm
                  onCancel={handleBack}
               />
            )}

            {view === "details" && selectedCampaign && (
               <CampaignDetails
                  campaign={selectedCampaign}
                  onBack={handleBack}
               />
            )}
         </div>
      </DashboardLayout>
   );
}

export default Campaigns;