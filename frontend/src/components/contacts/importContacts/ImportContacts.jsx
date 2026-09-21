import { useRef, useState } from "react";
import styles from "./importContacts.module.css";
import Icon from "../../icons/Icon";
import BackButton from "../../navigation/BackButton";
import { importContacts } from "../../../api/contacts";
import useFeedbackScroll from "../../../hooks/useFeedbackScroll";

const MAX_FILE_SIZE = 1024 * 1024;

function normalizeHeader(value)
{
   return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseCsvRows(content)
{
   const rows = [];
   let row = [];
   let value = "";
   let isQuoted = false;

   for(let index = 0; index < content.length; index += 1)
   {
      const character = content[index];

      if(character === "\r")
         continue;

      if(character === "\"")
      {
         if(isQuoted && content[index + 1] === "\"")
         {
            value += "\"";
            index += 1;
            continue;
         }

         isQuoted = !isQuoted;
         continue;
      }

      if(character === "," && !isQuoted)
      {
         row.push(value);
         value = "";
         continue;
      }

      if(character === "\n" && !isQuoted)
      {
         row.push(value);
         rows.push(row);
         row = [];
         value = "";
         continue;
      }

      value += character;
   }

   if(isQuoted)
      throw new Error("The CSV file contains an unmatched quote.");

   if(value || row.length > 0)
   {
      row.push(value);
      rows.push(row);
   }

   return rows;
}

function getColumnIndex(headers, names)
{
   return headers.findIndex(header => names.includes(header));
}

function parseCsvContacts(content)
{
   const rows = parseCsvRows(content);

   if(rows.length < 2)
      return [];

   const headers = rows[0].map(normalizeHeader);
   const emailIndex = getColumnIndex(headers, ["email", "emailaddress"]);
   const firstNameIndex = getColumnIndex(headers, ["firstname", "givenname"]);
   const lastNameIndex = getColumnIndex(headers, ["lastname", "surname", "familyname"]);

   if(emailIndex === -1)
      throw new Error("CSV files must include an email column.");

   return rows.slice(1)
      .filter(row => row.some(value => value.trim()))
      .map((row) => ({
         email: row[emailIndex]?.trim() || "",
         firstName: firstNameIndex === -1
            ? ""
            : row[firstNameIndex]?.trim() || "",
         lastName: lastNameIndex === -1
            ? ""
            : row[lastNameIndex]?.trim() || ""
      }));
}

function parseTextContacts(content)
{
   return content
      .split(/[,;\s]+/)
      .map(email => email.trim())
      .filter(Boolean)
      .map(email => ({ email }));
}

function ImportContacts({ onCancel, onImported }) {
   const [file,setFile] = useState(null);
   const [error, setError] = useState(null);
   const [importing, setImporting] = useState(false);
   const [result, setResult] = useState(null);
   const [isDragging, setIsDragging] = useState(false);
   const dragDepth = useRef(0);
   const feedbackMessage = error || (result
      ? `${result.imported} contact${result.imported === 1 ? "" : "s"} imported.`
      : null);
   const { feedbackRef, requestFeedbackScroll } = useFeedbackScroll(feedbackMessage);

   function handleFileSelection(selectedFile)
   {
      if(!selectedFile || importing)
         return;

      const isSupported = /\.(csv|txt)$/i.test(selectedFile.name);

      if(!isSupported)
      {
         setFile(null);
         requestFeedbackScroll();
         setError("Choose a CSV or text file.");
         return;
      }

      if(selectedFile.size > MAX_FILE_SIZE)
      {
         setFile(null);
         requestFeedbackScroll();
         setError("Choose a file smaller than 1 MB.");
         return;
      }

      setFile(selectedFile);
      setError(null);
      setResult(null);
   }

   function handleFileChange(event)
   {
      handleFileSelection(event.target.files[0]);
   }

   function handleDragEnter(event)
   {
      event.preventDefault();
      dragDepth.current += 1;

      if(!importing)
         setIsDragging(true);
   }

   function handleDragLeave(event)
   {
      event.preventDefault();
      dragDepth.current -= 1;

      if(dragDepth.current <= 0)
      {
         dragDepth.current = 0;
         setIsDragging(false);
      }
   }

   function handleDrop(event)
   {
      event.preventDefault();
      dragDepth.current = 0;
      setIsDragging(false);
      handleFileSelection(event.dataTransfer.files[0]);
   }

   async function handleImport()
   {
      if(!file || importing)
         return;

      setImporting(true);
      setError(null);
      setResult(null);

      try {
         const content = await file.text();
         const contacts = file.name.toLowerCase().endsWith(".csv")
            ? parseCsvContacts(content)
            : parseTextContacts(content);

         if(contacts.length === 0)
         {
            requestFeedbackScroll();
            setError("No contacts were found in this file.");
            return;
         }

         const response = await importContacts(contacts);

         requestFeedbackScroll();
         setResult(response.data);
         onImported();
      } catch(error) {
         console.error("Failed to import contacts:", error);
         requestFeedbackScroll();
         setError(error.message || "Unable to import contacts.");
      } finally {
         setImporting(false);
      }
   }

   return (
      <div className={styles.container}>
         <div className={styles.header}>
            <BackButton onClick={onCancel}>
               Back to Contacts
            </BackButton>

            <h1>Import Contacts</h1>

            <p>
               Import contacts from a CSV file or a plain text email list.
            </p>
         </div>

         <div aria-busy={importing} className={styles.card}>
            <label
               className={
                  `${styles.dropzone} ${isDragging ? styles.dragging : ""}`
               }
               onDragEnter={handleDragEnter}
               onDragLeave={handleDragLeave}
               onDragOver={(event) => event.preventDefault()}
               onDrop={handleDrop}
            >
               <input
                  type="file"
                  accept=".csv,.txt,text/csv,text/plain"
                  disabled={importing}
                  onChange={handleFileChange}
               />

               <div className={styles.uploadIcon}>
                  <Icon name="upload" size={22} />
               </div>

               <strong>
                  {file
                     ? file.name
                     : isDragging
                        ? "Drop your file here"
                        : "Choose a CSV or text file"}
               </strong>

               <span>
                  {file
                     ? `${(file.size / 1024).toFixed(1)} KB`
                     : isDragging
                        ? "Release to select it"
                        : "Drag and drop or click to browse"}
               </span>
            </label>

            <div className={styles.info}>
               <h2>File Format</h2>

               <p>
                  CSV files need an <code>email</code> column. First and last names are optional.
               </p>

               <div className={styles.columns}>
                  <code>firstName</code>
                  <code>lastName</code>
               </div>

               <p className={styles.textFileHelp}>
                  Text files should contain one email address per line. Contacts without names are imported normally.
               </p>
            </div>

            {error && (
               <div
                  className={styles.error}
                  ref={feedbackRef}
                  role="alert"
                  tabIndex="-1"
               >
                  {error}
               </div>
            )}

            {result && (
               <div
                  aria-live="polite"
                  className={styles.result}
                  ref={feedbackRef}
                  role="status"
                  tabIndex="-1"
               >
                  <strong>
                     {result.imported} contact{result.imported === 1 ? "" : "s"} imported
                  </strong>

                  <span>
                     {result.skipped} skipped ({result.invalid} invalid, {result.duplicates} duplicate)
                  </span>
               </div>
            )}

            <div className={styles.actions}>
               <button
                  className={styles.cancelButton}
                  disabled={importing}
                  onClick={onCancel}
                  type="button"
               >
                  {result ? "Back to Contacts" : "Cancel"}
               </button>

               <button
                  className={styles.importButton}
                  disabled={!file || importing}
                  onClick={handleImport}
                  type="button"
                  >
                  <Icon name="upload" size={16} />
                  {importing ? "Importing..." : "Import Contacts"}
               </button>
            </div>
         </div>
      </div>
   );
}

export default ImportContacts;
