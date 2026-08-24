import { useMemo, useState } from "react";
import styles from "./templateList.module.css";
import { deleteTemplate } from "../../../api/templates";
import { formatTemplateDate } from "../../../utils/utils";

function TemplateList({ templates, setTemplates, onCreate, onEdit, onPreview }) {
   const [search, setSearch] = useState("");

   const filteredTemplates = useMemo(() => {
      return templates.filter((template) => {
         const matchesSearch =
            template.name.toLowerCase().includes(search.toLowerCase()) ||
            template.subject.toLowerCase().includes(search.toLowerCase());

         return matchesSearch;
      });
   }, [templates, search]);

   async function deleteTemplateById(id)
   {
      try {
         await deleteTemplate(id);

         setTemplates(current =>
            current.filter(item => item.id !== id)
         );
      } catch(error) {
         console.error(error);
      }
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
            >
               + Create Template
            </button>
         </div>

         <div className={styles.toolbar}>
            <div className={styles.searchWrapper}>
               <span className={styles.searchIcon}>⌕</span>

               <input
                  type="text"
                  placeholder="Search templates..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
               />
            </div>
         </div>

         {filteredTemplates.length === 0 ? (
            <div className={styles.emptyState}>
               <div className={styles.emptyIcon}>✉</div>

               <h2>No templates found</h2>

               <p>
                  Try changing your search or create a new template.
               </p>

               <button
                  className={styles.primaryButton}
                  onClick={onCreate}
               >
                  Create Template
               </button>
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
                              <button  onClick={() => onPreview(template)}>
                                 Preview
                              </button>

                              <button onClick={() => onEdit(template)}>
                                 Edit
                              </button>

                              <button onClick={() => deleteTemplateById(template.id)}>
                                 delete
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
      </div>
   );
}

export default TemplateList;