import styles from "./confirmModal.module.css";

function ConfirmModal({
   confirmLabel,
   description,
   error,
   loading = false,
   loadingLabel = "Deleting...",
   onCancel,
   onConfirm,
   title
})
{
   return (
      <div className={styles.overlay}>
         <section
            aria-describedby="confirmation-description"
            aria-labelledby="confirmation-title"
            aria-modal="true"
            className={styles.modal}
            role="dialog"
         >
            <span className={styles.eyebrow}>Confirmation required</span>

            <h2 id="confirmation-title">{title}</h2>

            <p id="confirmation-description">{description}</p>

            {error && (
               <p className={styles.error}>{error}</p>
            )}

            <div className={styles.actions}>
               <button
                  className={styles.cancelButton}
                  disabled={loading}
                  onClick={onCancel}
                  type="button"
               >
                  Cancel
               </button>

               <button
                  className={styles.confirmButton}
                  disabled={loading}
                  onClick={onConfirm}
                  type="button"
               >
                  {loading ? loadingLabel : confirmLabel}
               </button>
            </div>
         </section>
      </div>
   );
}

export default ConfirmModal;
