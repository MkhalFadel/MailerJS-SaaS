import { useState } from "react";
import styles from "./templateEditor.module.css";

function TemplateEditor({ template, onCancel }) {
   const [name, setName] = useState(template?.name || "");
   const [subject, setSubject] = useState(template?.subject || "");
   const [content, setContent] = useState(
      template?.content?.trim() || ""
   );

   const isEditing = Boolean(template);

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

               <code>{"{{name}}"}</code>
               <code>{"{{company}}"}</code>
               <code>{"{{email}}"}</code>
            </div>

            <div className={styles.actions}>
               <button
                  className={styles.cancelButton}
                  onClick={onCancel}
               >
                  Cancel
               </button>

               <button className={styles.saveButton}>
                  Save Template
               </button>
            </div>
         </div>
      </div>
   );
}

export default TemplateEditor;