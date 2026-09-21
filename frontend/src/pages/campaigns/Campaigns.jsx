import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import CampaignList from "../../components/campaigns/campaignList/CampaignList";
import CampaignForm from "../../components/campaigns/campaignForm/CampaignForm";
import CampaignDetails from "../../components/campaigns/campaignDetails/CampaignDetails";
import FeedbackState from "../../components/feedback/FeedbackState";
import { getCampaigns } from "../../api/campaigns";
import useFeedbackScroll from "../../hooks/useFeedbackScroll";
import styles from "./campaigns.module.css";

function Campaigns() {
   const [view, setView] = useState("list");
   const [selectedCampaign, setSelectedCampaign] = useState(null);
   const [campaigns, setCampaigns] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [feedback, setFeedback] = useState(null);
   const { feedbackRef, requestFeedbackScroll } = useFeedbackScroll(feedback?.message);

   useEffect(() => {
         async function loadCampaigns()
         {
            try {
               const response = await getCampaigns();

               setCampaigns(response.data);
            } catch(error) {
               console.error("Failed to fetch campaigns:",error);
               setError(error.message || "Unable to load campaigns.");
            } finally {
               setLoading(false);
            }
         }

         loadCampaigns();
      },[]);

   function handleCreateCampaign() {
      setFeedback(null);
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
   function handleCampaignCreated(campaign, shouldShowSuccess = true) {
      setCampaigns(current => [campaign, ...current]);

      if(shouldShowSuccess)
         handleFeedback("success", "Campaign created successfully.");
   }

   function handleEditCampaign(campaign)
   {
      setFeedback(null);
      setSelectedCampaign(campaign);
      setView("edit");
   }

   function handleCampaignUpdated(campaign)
   {
      setCampaigns(current =>
         current.map(item => item.id === campaign.id ? campaign : item)
      );
      setSelectedCampaign(campaign);
      setView("details");
      handleFeedback("success", "Campaign updated successfully.");
   }

   function handleFeedback(type, message)
   {
      requestFeedbackScroll();
      setFeedback({ type, message });
   }


   return (
      <DashboardLayout>
         <div className={styles.page}>
            {feedback && (
               <FeedbackState feedbackRef={feedbackRef} type={feedback.type}>
                  {feedback.message}
               </FeedbackState>
            )}

            {view === "list" && loading && (
               <FeedbackState>
                  Loading campaigns...
               </FeedbackState>
            )}

            {view === "list" && !loading && error && (
               <FeedbackState type="error">
                  {error}
               </FeedbackState>
            )}

            {view === "list" && !loading && !error && (
               <CampaignList
                  campaigns={campaigns}
                  onCreate={handleCreateCampaign}
                  onView={handleViewCampaign}
               />
            )}

            {view === "create" && (
               <CampaignForm
                  onCreated={handleCampaignCreated}
                  onCancel={handleBack}
               />
            )}

            {view === "edit" && selectedCampaign && (
               <CampaignForm
                  campaign={selectedCampaign}
                  onCancel={handleBack}
                  onUpdated={handleCampaignUpdated}
               />
            )}

            {view === "details" && selectedCampaign && (
               <CampaignDetails
                  campaign={selectedCampaign}
                  onBack={handleBack}
                  onEdit={() => handleEditCampaign(selectedCampaign)}
               />
            )}
         </div>
      </DashboardLayout>
   );
}

export default Campaigns;
