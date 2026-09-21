import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import TemplateList from "../../components/templates/templateList/TemplateList";
import TemplateEditor from "../../components/templates/templateEditor/TemplateEditor";
import TemplatePreview from "../../components/templates/templatePreview/TemplatePreview";
import FeedbackState from "../../components/feedback/FeedbackState";
import { getTemplates } from "../../api/templates";
import useFeedbackScroll from "../../hooks/useFeedbackScroll";
import styles from "./templates.module.css";

function Templates() {
   const [view, setView] = useState("list");
   const [templates, setTemplates] = useState([]);
   const [selectedTemplate, setSelectedTemplate] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [feedback, setFeedback] = useState(null);
   const { feedbackRef, requestFeedbackScroll } = useFeedbackScroll(feedback?.message);

   useEffect(() => {
      async function loadTemplates()
      {
         try {
            const response = await getTemplates();

            setTemplates(response.data);
         } catch(error) {
            console.error("Failed to fetch templates:",error);
            setError(error.message || "Unable to load templates.");
         } finally {
            setLoading(false);
         }
      }

      loadTemplates();
   },[]);

   function handleCreate() {
      setFeedback(null);
      setSelectedTemplate(null);
      setView("editor");
   }

   function handleEdit(template) {
      setFeedback(null);
      setSelectedTemplate(template);
      setView("editor");
   }

   function handlePreview(template) {
      setSelectedTemplate(template);
      setView("preview");
   }

   function handleBack() {
      setSelectedTemplate(null);
      setView("list");
   }

   function handleFeedback(type, message)
   {
      if(type === "clear")
      {
         setFeedback(null);
         return;
      }

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

            {loading && (
               <FeedbackState>
                  Loading templates...
               </FeedbackState>
            )}

            {!loading && error && (
               <FeedbackState type="error">
                  {error}
               </FeedbackState>
            )}

            {!loading && !error && view === "list" && (
               <TemplateList
                  templates={templates}
                  setTemplates={setTemplates}
                  onCreate={handleCreate}
                  onEdit={handleEdit}
                  onPreview={handlePreview}
                  onFeedback={handleFeedback}
               />
            )}

            {!loading && !error && view === "editor" && (
               <TemplateEditor
                  template={selectedTemplate}
                  setTemplates={setTemplates}
                  onCancel={handleBack}
                  onSuccess={(message) => handleFeedback("success", message)}
               />
            )}

            {!loading && !error && view === "preview" && selectedTemplate && (
               <TemplatePreview
                  template={selectedTemplate}
                  onBack={handleBack}
                  onEdit={() => handleEdit(selectedTemplate)}
               />
            )}
         </div>
      </DashboardLayout>
   );
}

export default Templates;
