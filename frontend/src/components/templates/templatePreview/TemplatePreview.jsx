import styles from "./templatePreview.module.css";
import Icon from "../../icons/Icon";
import BackButton from "../../navigation/BackButton";

function TemplatePreview({ template, onBack, onEdit }) {
   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <div>
               <BackButton onClick={onBack}>
                  Back to Templates
               </BackButton>

               <h1>{template.name}</h1>

               <p>Preview this reusable email content.</p>
            </div>

            <button
               className={styles.editButton}
               onClick={onEdit}
               type="button"
               >
               <Icon name="edit" size={16} />
               Edit Template
            </button>
         </div>

         <div className={styles.previewCard}>
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
