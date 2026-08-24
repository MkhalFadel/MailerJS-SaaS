import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import TemplateList from "../../components/templates/templateList/TemplateList";
import TemplateEditor from "../../components/templates/templateEditor/TemplateEditor";
import TemplatePreview from "../../components/templates/templatePreview/TemplatePreview";
import { getTemplates } from "../../api/templates";
import styles from "./templates.module.css";

function Templates() {
   const [view, setView] = useState("list");
   const [templates, setTemplates] = useState([]);
   const [selectedTemplate, setSelectedTemplate] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      async function loadTemplates()
      {
         try {
            const response = await getTemplates();

            setTemplates(response.data);
         } catch(error) {
            console.error("Failed to fetch templates:",error);
            setError(error);
         } finally {
            setLoading(false);
         }
      }

      loadTemplates();
   },[]);

   function handleCreate() {
      setSelectedTemplate(null);
      setView("editor");
   }

   function handleEdit(template) {
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

   return (
      <DashboardLayout>
         <div className={styles.page}>

            {loading && <div>Loading...</div>}

            {error && <div>Error finding templates</div> }

            {!loading && !error && view === "list" && (
               <TemplateList
                  templates={templates}
                  setTemplates={setTemplates}
                  onCreate={handleCreate}
                  onEdit={handleEdit}
                  onPreview={handlePreview}
               />
            )}

            {!loading && !error && view === "editor" && (
               <TemplateEditor
                  template={selectedTemplate}
                  setTemplates={setTemplates}
                  onCancel={handleBack}
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