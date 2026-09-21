import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import EmailConfiguration from "../../components/settings/emailConfiguration/EmailConfiguration";
import FeedbackState from "../../components/feedback/FeedbackState";
import Icon from "../../components/icons/Icon";
import { getSmtpAccounts, deleteSmtpAccount } from "../../api/smtp";
import useFeedbackScroll from "../../hooks/useFeedbackScroll";
import styles from "./settings.module.css";

function Settings()
{
   const [activeSection,setActiveSection] = useState("email");

   const [smtpAccounts,setSmtpAccounts] = useState([]);
   const [selectedAccount,setSelectedAccount] = useState(null);

   const [showConfiguration,setShowConfiguration] = useState(false);
   const [loading,setLoading] = useState(true);
   const [error,setError] = useState(null);
   const [feedback, setFeedback] = useState(null);
   const [deletingAccountId, setDeletingAccountId] = useState(null);
   const { feedbackRef, requestFeedbackScroll } = useFeedbackScroll(feedback?.message);

   useEffect(() => {
      async function loadSmtpAccounts()
      {
         try {
            const response = await getSmtpAccounts();

            setSmtpAccounts(response.data);
         } catch(error) {
            console.error("Failed to fetch SMTP accounts:",error);
            setError(error.message || "Unable to load SMTP accounts.");
         } finally {
            setLoading(false);
         }
      }

      loadSmtpAccounts();
   },[]);

   function handleCreate()
   {
      setSelectedAccount(null);
      setShowConfiguration(true);
      setError(null);
      setFeedback(null);
   }

   function handleEdit(account)
   {
      setSelectedAccount(account);
      setShowConfiguration(true);
      setError(null);
      setFeedback(null);
   }

   function handleCancel()
   {
      setSelectedAccount(null);
      setShowConfiguration(false);
   }

   async function handleDelete(id)
   {
      if(deletingAccountId)
         return;

      setFeedback(null);
      setDeletingAccountId(id);

      try {
         await deleteSmtpAccount(id);

         setSmtpAccounts(current =>
            current.filter(account => account.id !== id)
         );

         if(selectedAccount?.id === id)
         {
            setSelectedAccount(null);
            setShowConfiguration(false);
         }

         handleFeedback("success", "SMTP account deleted successfully.");
      } catch(error) {
         console.error("Failed to delete SMTP account:",error);
         handleFeedback("error",
            error.message ||
            "Unable to delete SMTP account."
         );
      } finally {
         setDeletingAccountId(null);
      }
   }

   function handleFeedback(type, message)
   {
      requestFeedbackScroll();
      setFeedback({ type, message });
   }

   return (
      <DashboardLayout>
         <div className={styles.page}>
            <div className={styles.header}>
               <h1>Settings</h1>

               <p>
                  Manage your email configuration and sending preferences.
               </p>
            </div>

            {feedback && (
               <FeedbackState feedbackRef={feedbackRef} type={feedback.type}>
                  {feedback.message}
               </FeedbackState>
            )}

            <div className={styles.layout}>
               <aside className={styles.sidebar}>
                  <button
                     className={`${styles.navItem} ${
                        activeSection === "email"
                           ? styles.active
                           : ""
                     }`}
                  onClick={() => setActiveSection("email")}
                  type="button"
                  >
                     <Icon name="settings" size={18} />
                     Email Configuration
                  </button>

                  {/* <button
                     className={`${styles.navItem} ${
                        activeSection === "sender"
                           ? styles.active
                           : ""
                     }`}
                     onClick={() => setActiveSection("sender")}
                  >
                     <span>◎</span>
                     Sender Settings
                  </button> */}
               </aside>

               <main className={styles.content}>
                  {activeSection === "email" && (
                     <div className={styles.smtpSection}>
                        <div className={styles.smtpHeader}>
                           <div>
                              <h2>SMTP Accounts</h2>

                              <p>
                                 Manage the SMTP accounts used to send your emails.
                              </p>
                           </div>

                           {!showConfiguration && (
                              <button
                                 className={styles.addButton}
                                 disabled={Boolean(deletingAccountId)}
                                 onClick={handleCreate}
                                 type="button"
                                 >
                                 <Icon name="plus" size={16} />
                                 Add SMTP Account
                              </button>
                           )}
                        </div>

                        {error && (
                           <FeedbackState type="error">
                              {error}
                           </FeedbackState>
                        )}

                        {loading && (
                           <FeedbackState>
                              Loading SMTP accounts...
                           </FeedbackState>
                        )}

                        {!loading && !showConfiguration && smtpAccounts.length === 0 && (
                           <div className={styles.emptySmtp}>
                              <h3>No SMTP accounts</h3>

                              <p>
                                 Add an SMTP account to start sending emails.
                              </p>

                              <button
                                 className={styles.addButton}
                                 disabled={Boolean(deletingAccountId)}
                                 onClick={handleCreate}
                                 type="button"
                                 >
                                 <Icon name="plus" size={16} />
                                 Add SMTP Account
                              </button>
                           </div>
                        )}

                        {!loading && !showConfiguration && smtpAccounts.length > 0 && (
                           <div className={styles.smtpList}>
                              {smtpAccounts.map((account) => (
                                 <div
                                    className={styles.smtpAccount}
                                    key={account.id}
                                 >
                                    <div className={styles.smtpInfo}>
                                       <span className={styles.smtpProvider}>
                                          {account.provider}
                                       </span>

                                       <span className={styles.smtpEmail}>
                                          {account.senderEmail}
                                       </span>

                                       <div className={styles.smtpDetails}>
                                          <span>
                                             {account.host}
                                          </span>

                                          <span>
                                             •
                                          </span>

                                          <span>
                                             {account.port}
                                          </span>

                                          {account.isDefault && (
                                             <>
                                                <span>
                                                   •
                                                </span>

                                                <span className={styles.smtpBadge}>
                                                   Default
                                                </span>
                                             </>
                                          )}
                                       </div>
                                    </div>

                                    <div className={styles.smtpActions}>
                                       <button
                                          className={styles.editButton}
                                          disabled={Boolean(deletingAccountId)}
                                          onClick={() => handleEdit(account)}
                                          type="button"
                                          >
                                          <Icon name="edit" size={15} />
                                          Edit
                                       </button>

                                       <button
                                          className={styles.deleteButton}
                                          disabled={Boolean(deletingAccountId)}
                                          onClick={() => handleDelete(account.id)}
                                          type="button"
                                          >
                                          <Icon name="trash" size={15} />
                                          {deletingAccountId === account.id
                                             ? "Deleting..."
                                             : "Delete"}
                                       </button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}

                        {!loading && showConfiguration && (
                           <EmailConfiguration
                              account={selectedAccount}
                              setSmtpAccounts={setSmtpAccounts}
                              onCancel={handleCancel}
                              onSuccess={(message) => handleFeedback("success", message)}
                           />
                        )}
                     </div>
                  )}

                  {/* {activeSection === "sender" && (
                     <SenderSettings />
                  )} */}
               </main>
            </div>
         </div>
      </DashboardLayout>
   );
}

export default Settings;
