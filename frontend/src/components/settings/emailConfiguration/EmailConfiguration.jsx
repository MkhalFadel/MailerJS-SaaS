import { useState } from "react";
import styles from "./emailConfiguration.module.css";

const providers = [
   {
      name: "Gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false
   },
   {
      name: "Outlook",
      host: "smtp.office365.com",
      port: 587,
      secure: false
   },
   {
      name: "Yahoo",
      host: "smtp.mail.yahoo.com",
      port: 587,
      secure: false
   },
   {
      name: "Zoho",
      host: "smtp.zoho.com",
      port: 587,
      secure: false
   },
   {
      name: "iCloud",
      host: "smtp.mail.me.com",
      port: 587,
      secure: false
   },
   {
      name: "Custom SMTP",
      host: "",
      port: 587,
      secure: false
   }
];

function EmailConfiguration() {
   const [provider,setProvider] = useState("Gmail");
   const [host,setHost] = useState("smtp.gmail.com");
   const [port,setPort] = useState("587");
   const [secure,setSecure] = useState(false);
   const [username,setUsername] = useState("fadel@example.com");
   const [password,setPassword] = useState("password123");
   const [showPassword,setShowPassword] = useState(false);

   function handleProviderChange(event) {
      const selectedProvider = event.target.value;

      setProvider(selectedProvider);

      const providerData = providers.find(
         (item) => item.name === selectedProvider
      );

      if (!providerData) {
         return;
      }

      setHost(providerData.host);
      setPort(String(providerData.port));
      setSecure(providerData.secure);
   }

   function handleSave(event) {
      event.preventDefault();
   }

   function handleTestConnection() {
      console.log("Testing SMTP connection...");
   }

   return (
      <div className={styles.container}>
         <div className={styles.sectionHeader}>
            <div>
               <h2>Email Configuration</h2>

               <p>
                  Configure the SMTP server used to send your emails.
               </p>
            </div>

            <span className={styles.status}>
               <span></span>
               Configured
            </span>
         </div>

         <form
            className={styles.card}
            onSubmit={handleSave}
         >
            <div className={styles.form}>
               <label className={styles.field}>
                  <span>Email Provider</span>

                  <select
                     value={provider}
                     onChange={handleProviderChange}
                  >
                     {providers.map((item) => (
                        <option
                           value={item.name}
                           key={item.name}
                        >
                           {item.name}
                        </option>
                     ))}
                  </select>

                  <small>
                     Select your email service provider.
                  </small>
               </label>

               <div className={styles.row}>
                  <label className={styles.field}>
                     <span>SMTP Host</span>

                     <input
                        type="text"
                        value={host}
                        onChange={(event) => setHost(event.target.value)}
                        placeholder="smtp.example.com"
                     />
                  </label>

                  <label className={styles.field}>
                     <span>SMTP Port</span>

                     <input
                        type="number"
                        value={port}
                        onChange={(event) => setPort(event.target.value)}
                        placeholder="587"
                     />
                  </label>
               </div>

               <div className={styles.secureRow}>
                  <div>
                     <strong>Secure Connection</strong>

                     <p>
                        Use SSL/TLS encryption when connecting to the SMTP server.
                     </p>
                  </div>

                  <button
                     type="button"
                     className={`${styles.toggle} ${
                        secure ? styles.enabled : ""
                     }`}
                     onClick={() => setSecure(!secure)}
                     aria-label="Toggle secure connection"
                  >
                     <span></span>
                  </button>
               </div>

               <div className={styles.divider}></div>

               <div className={styles.credentialsHeader}>
                  <div>
                     <h3>SMTP Credentials</h3>

                     <p>
                        Credentials are used to authenticate with your SMTP server.
                     </p>
                  </div>
               </div>

               <label className={styles.field}>
                  <span>Username</span>

                  <input
                     type="email"
                     value={username}
                     onChange={(event) => setUsername(event.target.value)}
                     placeholder="you@example.com"
                  />
               </label>

               <label className={styles.field}>
                  <span>Password</span>

                  <div className={styles.passwordWrapper}>
                     <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                     />

                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                     >
                        {showPassword ? "Hide" : "Show"}
                     </button>
                  </div>

                  <small>
                     Your password will be securely stored.
                  </small>
               </label>
            </div>

            <div className={styles.actions}>
               <button
                  type="button"
                  className={styles.testButton}
                  onClick={handleTestConnection}
               >
                  Test Connection
               </button>

               <button
                  type="submit"
                  className={styles.saveButton}
               >
                  Save Changes
               </button>
            </div>
         </form>
      </div>
   );
}

export default EmailConfiguration;