import { useState } from "react";
import { createTemplate, updateTemplate } from "../../../api/templates";
import styles from "./templateEditor.module.css";

function TemplateEditor({ template, setTemplates, onCancel }) {
   const [name, setName] = useState(template?.name || "");
   const [subject, setSubject] = useState(template?.subject || "");
   const [content, setContent] = useState(template?.content?.trim() || "");

   const isEditing = Boolean(template);

   async function createNewTemplate()
   {
      try {
         const response = await createTemplate({
            name,
            subject,
            content
         });

         setTemplates(current => [
            ...current,
            response.data
         ]);

         onCancel();
      } catch(error) {
         console.error(error);
      }
   }

   async function editExistingTemplate()
   {
      try {
         const response = await updateTemplate(template.id,{
            name,
            subject,
            content
         });

         setTemplates(current =>
            current.map(item =>
               item.id === response.data.id
                  ? response.data
                  : item
            )
         );

         onCancel();
      } catch(error) {
         console.error(error);
      }
   }

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <button
               className={styles.backButton}
               onClick={onCancel}
            >
               ← Back to Templates
            </button>

            <h1>
               {isEditing ? "Edit Template" : "Create Template"}
            </h1>

            <p>
               {isEditing
                  ? "Update your email template."
                  : "Create a reusable email template."}
            </p>
         </div>

         <div className={styles.editorCard}>
            <div className={styles.form}>
               <label className={styles.field}>
                  <span>Template Name</span>

                  <input
                     type="text"
                     value={name}
                     onChange={(event) => setName(event.target.value)}
                     placeholder="Welcome Email"
                  />
               </label>

               <label className={styles.field}>
                  <span>Subject</span>

                  <input
                     type="text"
                     value={subject}
                     onChange={(event) => setSubject(event.target.value)}
                     placeholder="Welcome to {{company}}"
                  />
               </label>
            </div>

            <div className={styles.editorSection}>
               <div className={styles.editorHeader}>
                  <div>
                     <h2>HTML Content</h2>
                     <p>
                        Use placeholders such as{" "}
                        <code>{"{{name}}"}</code> in your template.
                     </p>
                  </div>

                  <span className={styles.htmlBadge}>HTML</span>
               </div>

               <textarea
                  className={styles.editor}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  spellCheck="false"
                  placeholder="<h1>Hello {{name}}</h1>"
               />
            </div>

            <div className={styles.placeholders}>
               <span>Available placeholders</span>

               <code>{"{{first_name}}"}</code>
               <code>{"{{last_name}}"}</code>
               <code>{"{{email}}"}</code>
            </div>

            <div className={styles.actions}>
               <button
                  className={styles.cancelButton}
                  onClick={onCancel}
               >
                  Cancel
               </button>

               <button className={styles.saveButton} onClick={isEditing ? editExistingTemplate : createNewTemplate}>
                  Save Template
               </button>
            </div>
         </div>
      </div>
   );
}

export default TemplateEditor;