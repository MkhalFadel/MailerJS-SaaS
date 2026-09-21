import { useState } from "react";
import styles from "./emailConfiguration.module.css";
import { createSmtpAccount, updateSmtpAccount, testSmtpConnection } from "../../../api/smtp";
import Icon from "../../icons/Icon";
import FeedbackState from "../../feedback/FeedbackState";
import useFeedbackScroll from "../../../hooks/useFeedbackScroll";

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

function getInitialFormData(account)
{
   return {
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
   };
}

function EmailConfiguration({ account, setSmtpAccounts, onCancel, onSuccess })
{
   const [formData,setFormData] = useState(
      () => account ? getInitialFormData(account) : defaultFormData
   );

   const [showPassword, setShowPassword] = useState(false);
   const [loading, setLoading] = useState(false);
   const [testing, setTesting] = useState(false);
   const [error, setError] = useState(null);
   const [connectionStatus, setConnectionStatus] = useState(null);
   const feedbackMessage = error || connectionStatus?.message;
   const { feedbackRef, requestFeedbackScroll } = useFeedbackScroll(feedbackMessage);

   const isEditing = Boolean(account);

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
      setConnectionStatus(null);

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
               requestFeedbackScroll();
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

         setFormData(current => ({
            ...current,
            password: ""
         }));

         onSuccess?.(
            isEditing
               ? "SMTP account updated successfully."
               : "SMTP account created successfully."
         );

         onCancel?.();

      } catch(error) {
         console.error("Unable to save SMTP account:", error);

         requestFeedbackScroll();
         setError(error.message || "Unable to save SMTP account.");
      } finally {
         setLoading(false);
      }
   }

   async function handleTestConnection()
   {
      if(!account)
      {
         requestFeedbackScroll();
         setConnectionStatus({
            success: false,
            message: "Save the SMTP account before testing the connection."
         });

         return;
      }

      setTesting(true);
      setError(null);
      setConnectionStatus(null);

      try {
         await testSmtpConnection(account.id);

         requestFeedbackScroll();
         setConnectionStatus({
            success: true,
            message: "SMTP connection successful."
         });
      } catch(error) {
         console.error("Unable to test SMTP connection:", error);

         requestFeedbackScroll();
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

            <span
               className={`${styles.status} ${
                  isEditing ? styles.configured : styles.unconfigured
               }`}
            >
               <span></span>
               {isEditing ? "Configured" : "Not configured"}
            </span>
         </div>

         {feedbackMessage && (
            <FeedbackState
               feedbackRef={feedbackRef}
               type={error || connectionStatus?.success === false ? "error" : "success"}
            >
               {feedbackMessage}
            </FeedbackState>
         )}

         <form
            aria-busy={loading || testing}
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
                     disabled={loading || testing}
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
                        disabled={loading || testing}
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
                        disabled={loading || testing}
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
                     disabled={loading || testing}
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
                        disabled={isEditing || loading || testing}
                     />

                     {!isEditing && (
                        <button
                           type="button"
                           aria-label={showPassword ? "Hide password" : "Show password"}
                           onClick={() =>
                              setShowPassword(current => !current)
                           }
                           disabled={loading || testing}
                        >
                           <Icon name={showPassword ? "eyeOff" : "eye"} size={17} />
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
                     disabled={loading || testing}
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
                     disabled={loading || testing}
                  />
               </label>
            </div>

            <div className={styles.actions}>
               {isEditing && (
                  <button
                     type="button"
                     className={styles.testButton}
                     onClick={handleTestConnection}
                     disabled={testing || loading}
                  >
                     <Icon name="send" size={16} />
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
                  <Icon name={isEditing ? "edit" : "plus"} size={16} />
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
