import { useEffect, useState } from "react";
import styles from "./emailConfiguration.module.css";
import { createSmtpAccount, updateSmtpAccount, testSmtpConnection } from "../../../api/smtp";

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

const defaultFormData = {
   provider: "Gmail",
   host: "smtp.gmail.com",
   port: "587",
   secure: false,
   username: "",
   password: "",
   senderName: "",
   senderEmail: ""
};

function EmailConfiguration({ account, setSmtpAccounts, onCancel })
{
   const [formData,setFormData] = useState(defaultFormData);

   const [showPassword, setShowPassword] = useState(false);
   const [loading, setLoading] = useState(false);
   const [testing, setTesting] = useState(false);
   const [error, setError] = useState(null);
   const [message, setMessage] = useState(null);
   const [connectionStatus, setConnectionStatus] = useState(null);

   const isEditing = Boolean(account);

   useEffect(() => {
      setFormData({
         provider: account?.provider || "Gmail",
         host: account?.host || "smtp.gmail.com",
         port: account?.port
            ? String(account.port)
            : "587",
         secure: account?.secure || false,
         username: account?.username || "",
         password: "",
         senderName: account?.senderName || "",
         senderEmail: account?.senderEmail || ""
      });

      setError(null);
      setMessage(null);
   },[account]);

   function handleChange(event)
   {
      const { name,value } = event.target;

      setFormData(current => ({
         ...current,
         [name]: value
      }));
   }

   function handleProviderChange(event)
   {
      const selectedProvider = event.target.value;

      const providerData = providers.find(
         item => item.name === selectedProvider
      );

      if(!providerData)
         return;

      setFormData(current => ({
         ...current,
         provider: selectedProvider,
         host: providerData.host,
         port: String(providerData.port),
         secure: providerData.secure
      }));
   }

   function handleSecureToggle()
   {
      setFormData(current => ({
         ...current,
         secure: !current.secure
      }));
   }

   async function handleSave(event)
   {
      event.preventDefault();

      setLoading(true);
      setError(null);
      setMessage(null);

      try {
         const data = {
            provider: formData.provider,
            host: formData.host,
            port: Number(formData.port),
            secure: formData.secure,
            username: formData.username,
            senderName: formData.senderName,
            senderEmail: formData.senderEmail
         };

         if(formData.password.trim())
            data.password = formData.password;

         let response;

         if(isEditing)
         {
            response = await updateSmtpAccount(
               account.id,
               data
            );

            setSmtpAccounts(current =>
               current.map(item =>
                  item.id === response.data.id
                     ? response.data
                     : item
               )
            );
         }
         else
         {
            if(!formData.password.trim())
            {
               setError("SMTP password is required.");
               return;
            }

            data.password = formData.password;

            response = await createSmtpAccount(data);

            setSmtpAccounts(current => [
               ...current,
               response.data
            ]);
         }

         setMessage(isEditing ? "SMTP account updated successfully." : "SMTP account created successfully.");

         setFormData(current => ({
            ...current,
            password: ""
         }));

         if(onCancel)
            onCancel();

      } catch(error) {
         console.error(error);

         setError(error.message || "Unable to save SMTP account.");
      } finally {
         setLoading(false);
      }
   }

   async function handleTestConnection()
   {
      if(!account)
      {
         setConnectionStatus({
            success: false,
            message: "Save the SMTP account before testing the connection."
         });

         return;
      }

      setTesting(true);
      setConnectionStatus(null);

      try {
         await testSmtpConnection(account.id);

         setConnectionStatus({
            success: true,
            message: "SMTP connection successful."
         });
      } catch(error) {
         console.error(error);

         setConnectionStatus({
            success: false,
            message: error.message || "Unable to connect to the SMTP server."
         });
      } finally {
         setTesting(false);
      }
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
               {isEditing ? "Configured" : "Not configured"}
            </span>
         </div>

         {error && (
            <div className={styles.error}>
               {error}
            </div>
         )}

         {message && (
            <div className={styles.success}>
               {message}
            </div>
         )}

         <form
            className={styles.card}
            onSubmit={handleSave}
         >
            <div className={styles.form}>
               <label className={styles.field}>
                  <span>Email Provider</span>

                  <select
                     name="provider"
                     value={formData.provider}
                     onChange={handleProviderChange}
                  >
                     {providers.map(item => (
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
                        name="host"
                        value={formData.host}
                        onChange={handleChange}
                        placeholder="smtp.example.com"
                     />
                  </label>

                  <label className={styles.field}>
                     <span>SMTP Port</span>

                     <input
                        type="number"
                        name="port"
                        value={formData.port}
                        onChange={handleChange}
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
                        formData.secure ? styles.enabled : ""
                     }`}
                     onClick={handleSecureToggle}
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
                     type="text"
                     name="username"
                     value={formData.username}
                     onChange={handleChange}
                     placeholder="you@example.com"
                  />
               </label>

               <label className={styles.field}>
                  <span>Password</span>

                  <div className={styles.passwordWrapper}>
                     <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={
                           isEditing
                              ? "Password is securely stored"
                              : "Enter SMTP password"
                        }
                        disabled={isEditing}
                     />

                     {!isEditing && (
                        <button
                           type="button"
                           onClick={() =>
                              setShowPassword(current => !current)
                           }
                        >
                           {showPassword ? "Hide" : "Show"}
                        </button>
                     )}
                  </div>

                  <small>
                     {isEditing
                        ? "Your SMTP password cannot be viewed or changed."
                        : "Your password will be encrypted and securely stored."}
                  </small>
               </label>

               <label className={styles.field}>
                  <span>Sender Name</span>

                  <input
                     type="text"
                     name="senderName"
                     value={formData.senderName}
                     onChange={handleChange}
                     placeholder="MailerJS"
                  />
               </label>

               <label className={styles.field}>
                  <span>Sender Email</span>

                  <input
                     type="email"
                     name="senderEmail"
                     value={formData.senderEmail}
                     onChange={handleChange}
                     placeholder="you@example.com"
                  />
               </label>
            </div>

            {connectionStatus && (
               <div
                  className={
                     connectionStatus.success
                        ? styles.connectionSuccess
                        : styles.connectionError
                  }
               >
                  <span>
                     {connectionStatus.success ? "✓" : "⚠"}
                  </span>

                  <span>
                     {connectionStatus.message}
                  </span>
               </div>
            )}

            <div className={styles.actions}>
               {isEditing && (
                  <button
                     type="button"
                     className={styles.testButton}
                     onClick={handleTestConnection}
                     disabled={testing || loading}
                  >
                     {testing
                        ? "Testing..."
                        : "Test Connection"}
                  </button>
               )}

               <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={loading || testing}
               >
                  {loading
                     ? "Saving..."
                     : isEditing
                        ? "Save Changes"
                        : "Add SMTP Account"}
               </button>
            </div>
         </form>
      </div>
   );
}

export default EmailConfiguration;