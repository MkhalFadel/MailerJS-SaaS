import { useState } from "react";
import styles from "./importContacts.module.css";

function ImportContacts({ onCancel }) {
   const [file,setFile] = useState(null);

   function handleFileChange(event) {
      const selectedFile = event.target.files[0];

      if (selectedFile) {
         setFile(selectedFile);
      }
   }

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <button
               className={styles.backButton}
               onClick={onCancel}
            >
               ← Back to Contacts
            </button>

            <h1>Import Contacts</h1>

            <p>
               Import multiple contacts from a CSV file.
            </p>
         </div>

         <div className={styles.card}>
            <label className={styles.dropzone}>
               <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
               />

               <div className={styles.uploadIcon}>
                  ↑
               </div>

               <strong>
                  {file
                     ? file.name
                     : "Choose a CSV file"}
               </strong>

               <span>
                  {file
                     ? `${(file.size / 1024).toFixed(1)} KB`
                     : "Drag and drop or click to browse"}
               </span>
            </label>

            <div className={styles.info}>
               <h2>CSV Format</h2>

               <p>
                  Your CSV file should contain columns such as:
               </p>

               <div className={styles.columns}>
                  <code>firstName</code>
                  <code>lastName</code>
                  <code>email</code>
                  <code>company</code>
                  <code>phone</code>
               </div>
            </div>

            <div className={styles.actions}>
               <button
                  className={styles.cancelButton}
                  onClick={onCancel}
               >
                  Cancel
               </button>

               <button
                  className={styles.importButton}
                  disabled={!file}
               >
                  Import Contacts
               </button>
            </div>
         </div>
      </div>
   );
}

export default ImportContacts;