import { useMemo, useState } from "react";
import styles from "./templateList.module.css";
import { deleteTemplate } from "../../../api/templates";
import { formatTemplateDate } from "../../../utils/utils";
import EmptyState from "../../feedback/EmptyState";
import ConfirmModal from "../../feedback/ConfirmModal";
import Icon from "../../icons/Icon";

function TemplateList({ templates, setTemplates, onCreate, onEdit, onPreview }) {
   const [search, setSearch] = useState("");
   const [templateToDelete, setTemplateToDelete] = useState(null);
   const [deleteError, setDeleteError] = useState(null);
   const [deleting, setDeleting] = useState(false);

   const filteredTemplates = useMemo(() => {
      return templates.filter((template) => {
         const matchesSearch =
            template.name.toLowerCase().includes(search.toLowerCase()) ||
            template.subject.toLowerCase().includes(search.toLowerCase());

         return matchesSearch;
      });
   }, [templates, search]);

   function removeTemplate(id)
   {
      setTemplates(current =>
         current.filter(item => item.id !== id)
      );
   }

   async function requestTemplateDeletion(template)
   {
      if(deleting)
         return;

      setDeleteError(null);
      setDeleting(true);

      try {
         await deleteTemplate(template.id);
         removeTemplate(template.id);
      } catch(error) {
         if(error.status === 409 && error.data?.requiresConfirmation)
         {
            setTemplateToDelete({
               ...template,
               campaignCount: error.data.campaignCount
            });
            return;
         }

         console.error("Failed to delete template:", error);
         setDeleteError(error.message || "Unable to delete this template.");
      } finally {
         setDeleting(false);
      }
   }

   async function confirmTemplateDeletion()
   {
      if(!templateToDelete || deleting)
         return;

      setDeleteError(null);
      setDeleting(true);

      try {
         await deleteTemplate(templateToDelete.id, true);
         removeTemplate(templateToDelete.id);
         setTemplateToDelete(null);
      } catch(error) {
         console.error("Failed to delete template:", error);
         setDeleteError(error.message || "Unable to delete this template.");
      } finally {
         setDeleting(false);
      }
   }

   function closeTemplateConfirmation()
   {
      if(deleting)
         return;

      setTemplateToDelete(null);
      setDeleteError(null);
   }

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <h1>Templates</h1>
               <p>
                  Create and manage reusable email templates.
               </p>
            </div>

            <button
               className={styles.primaryButton}
               onClick={onCreate}
               type="button"
               >
               <Icon name="plus" size={16} />
               Create Template
            </button>
         </div>

         <div className={styles.toolbar}>
            <div className={styles.searchWrapper}>
               <Icon className={styles.searchIcon} name="search" size={18} />

               <input
                  type="text"
                  placeholder="Search templates..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
               />
            </div>
         </div>

         {deleteError && !templateToDelete && (
            <div className={styles.deleteError}>{deleteError}</div>
         )}

         {filteredTemplates.length === 0 ? (
            <div className={styles.emptyCard}>
               <EmptyState
                  actionLabel="Create Template"
                  description="Try changing your search or create a new template."
                  icon="template"
                  onAction={onCreate}
                  title="No templates found"
               />
            </div>
         ) : (
            <div className={styles.grid}>
               {filteredTemplates.map((template) => (
                  <div
                     className={styles.card}
                     key={template.id}
                  >
                     <button
                        className={styles.preview}
                        onClick={() => onPreview(template)}
                     >
                        <div className={styles.previewContent}>
                           <div className={styles.previewHeader}>
                              <span />
                              <span />
                              <span />
                           </div>

                           <div className={styles.previewBody}>
                              <div className={styles.previewTitle}>
                                 {template.name}
                              </div>

                              <div className={styles.previewLine} />
                              <div className={styles.previewLine} />
                              <div className={styles.previewLineShort} />

                              <div className={styles.previewButton}>
                                 View
                              </div>
                           </div>
                        </div>
                     </button>

                     <div className={styles.cardContent}>
                        <div className={styles.cardTitle}>
                           <div>
                              <h2>{template.name}</h2>
                              <p>{template.subject}</p>
                           </div>
                        </div>

                        <div className={styles.cardFooter}>
                           <span>
                              Updated {formatTemplateDate(template.updatedAt)}
                           </span>

                           <div className={styles.actions}>
                              <button onClick={() => onPreview(template)} type="button">
                                 <Icon name="eye" size={15} />
                                 Preview
                              </button>

                              <button onClick={() => onEdit(template)} type="button">
                                 <Icon name="edit" size={15} />
                                 Edit
                              </button>

                              <button
                                 className={styles.deleteButton}
                                 onClick={() => requestTemplateDeletion(template)}
                                 type="button"
                              >
                                 <Icon name="trash" size={15} />
                                 Delete
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}

         <div className={styles.footer}>
            Showing {filteredTemplates.length} of {templates.length} templates
         </div>

         {templateToDelete && (
            <ConfirmModal
               confirmLabel="Delete Template"
               description={`${templateToDelete.name} is currently used by ${templateToDelete.campaignCount} campaign${templateToDelete.campaignCount === 1 ? "" : "s"}. Deleting it will remove the template from those campaigns. Those campaigns cannot be sent until another template is selected.`}
               error={deleteError}
               loading={deleting}
               onCancel={closeTemplateConfirmation}
               onConfirm={confirmTemplateDeletion}
               title="Delete template?"
            />
         )}
      </div>
   );
}

export default TemplateList;
