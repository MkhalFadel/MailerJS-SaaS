import { useState } from "react";
import { createTemplate, updateTemplate } from "../../../api/templates";
import styles from "./templateEditor.module.css";
import Icon from "../../icons/Icon";
import BackButton from "../../navigation/BackButton";
import FeedbackState from "../../feedback/FeedbackState";
import useFeedbackScroll from "../../../hooks/useFeedbackScroll";

function TemplateEditor({ template, setTemplates, onCancel, onSuccess }) {
   const [name, setName] = useState(template?.name || "");
   const [content, setContent] = useState(template?.content?.trim() || "");
   const [error, setError] = useState(null);
   const [saving, setSaving] = useState(false);
   const { feedbackRef, requestFeedbackScroll } = useFeedbackScroll(error);

   const isEditing = Boolean(template);

   async function handleSubmit(event)
   {
      event.preventDefault();

      if(saving)
         return;

      setError(null);
      setSaving(true);

      try {
         if(isEditing)
         {
            const response = await updateTemplate(template.id, {
               name,
               content
            });

            setTemplates(current =>
               current.map(item =>
                  item.id === response.data.id
                     ? response.data
                     : item
               )
            );
         }
         else
         {
            const response = await createTemplate({
               name,
               content
            });

            setTemplates(current => [
               ...current,
               response.data
            ]);
         }

         onSuccess?.(
            isEditing
               ? "Template updated successfully."
               : "Template created successfully."
         );
         onCancel();
      } catch(error) {
         console.error("Unable to save template:", error);
         requestFeedbackScroll();
         setError(error.message || "Unable to save this template.");
      } finally {
         setSaving(false);
      }
   }

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <BackButton onClick={onCancel}>
               Back to Templates
            </BackButton>

            <h1>
               {isEditing ? "Edit Template" : "Create Template"}
            </h1>

            <p>
               {isEditing
                  ? "Update your email template."
                  : "Create a reusable email template."}
            </p>
         </div>

         {error && (
            <FeedbackState feedbackRef={feedbackRef} type="error">
               {error}
            </FeedbackState>
         )}

         <form
            aria-busy={saving}
            className={styles.editorCard}
            onSubmit={handleSubmit}
         >
            <div className={styles.form}>
               <label className={styles.field}>
                  <span>Template Name</span>

                  <input
                     type="text"
                     value={name}
                     onChange={(event) => setName(event.target.value)}
                     placeholder="Welcome Email"
                     disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
                  onClick={onCancel}
                  type="button"
               >
                  Cancel
               </button>

               <button
                  className={styles.saveButton}
                  disabled={saving}
                  type="submit"
               >
                  <Icon name={isEditing ? "edit" : "plus"} size={16} />
                  {saving ? "Saving..." : "Save Template"}
               </button>
            </div>
         </form>
      </div>
   );
}

export default TemplateEditor;
