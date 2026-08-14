import { useState } from "react";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import TemplateList from "../../components/templates/templateList/TemplateList";
import TemplateEditor from "../../components/templates/templateEditor/TemplateEditor";
import TemplatePreview from "../../components/templates/templatePreview/TemplatePreview";
import styles from "./templates.module.css";

const templatesData = [
   {
      id: 1,
      name: "Welcome Email",
      subject: "Welcome to {{company}}",
      updatedAt: "Aug 10, 2026",
      status: "active",
      content: `
         <h1>Hello {{name}}</h1>
         <p>Welcome to {{company}}.</p>
         <p>We're happy to have you with us.</p>
      `
   },
   {
      id: 2,
      name: "Monthly Newsletter",
      subject: "{{company}} Monthly Newsletter",
      updatedAt: "Aug 8, 2026",
      status: "active",
      content: `
         <h1>{{company}} Newsletter</h1>
         <p>Hello {{name}},</p>
         <p>Here are this month's latest updates.</p>
      `
   },
   {
      id: 3,
      name: "Product Update",
      subject: "What's new at {{company}}",
      updatedAt: "Aug 5, 2026",
      status: "active",
      content: `
         <h1>What's New</h1>
         <p>Hi {{name}},</p>
         <p>We've released some exciting new features.</p>
      `
   },
   {
      id: 4,
      name: "Password Reset",
      subject: "Reset your password",
      updatedAt: "Aug 2, 2026",
      status: "active",
      content: `
         <h1>Password Reset</h1>
         <p>Hello {{name}},</p>
         <p>Click the button below to reset your password.</p>
      `
   }
];

function Templates() {
   const [view, setView] = useState("list");
   const [selectedTemplate, setSelectedTemplate] = useState(null);

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
            {view === "list" && (
               <TemplateList
                  templates={templatesData}
                  onCreate={handleCreate}
                  onEdit={handleEdit}
                  onPreview={handlePreview}
               />
            )}

            {view === "editor" && (
               <TemplateEditor
                  template={selectedTemplate}
                  onCancel={handleBack}
               />
            )}

            {view === "preview" && selectedTemplate && (
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