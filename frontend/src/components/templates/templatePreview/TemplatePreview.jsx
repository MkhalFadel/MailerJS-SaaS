import styles from "./templatePreview.module.css";

function TemplatePreview({ template, onBack, onEdit }) {
   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <button
                  className={styles.backButton}
                  onClick={onBack}
               >
                  ← Back to Templates
               </button>

               <h1>{template.name}</h1>

               <p>{template.subject}</p>
            </div>

            <button
               className={styles.editButton}
               onClick={onEdit}
            >
               Edit Template
            </button>
         </div>

         <div className={styles.previewCard}>
            <div className={styles.previewToolbar}>
               <div>
                  <span>From</span>
                  <strong>you@example.com</strong>
               </div>

               <div>
                  <span>Subject</span>
                  <strong>{template.subject}</strong>
               </div>
            </div>

            <div className={styles.emailPreview}>
               <div
                  dangerouslySetInnerHTML={{
                     __html: template.content
                  }}
               />
            </div>
         </div>
      </div>
   );
}

export default TemplatePreview;