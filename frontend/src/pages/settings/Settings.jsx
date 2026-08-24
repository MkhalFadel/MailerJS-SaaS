import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";
import EmailConfiguration from "../../components/settings/emailConfiguration/EmailConfiguration";
import SenderSettings from "../../components/settings/senderSettings/SenderSettings";
import { getSmtpAccounts, deleteSmtpAccount } from "../../api/smtp";
import styles from "./settings.module.css";

function Settings()
{
   const [activeSection,setActiveSection] = useState("email");

   const [smtpAccounts,setSmtpAccounts] = useState([]);
   const [selectedAccount,setSelectedAccount] = useState(null);

   const [showConfiguration,setShowConfiguration] = useState(false);
   const [loading,setLoading] = useState(true);
   const [error,setError] = useState(null);

   useEffect(() => {
      async function loadSmtpAccounts()
      {
         try {
            const response = await getSmtpAccounts();

            setSmtpAccounts(response.data);
         } catch(error) {
            console.error("Failed to fetch SMTP accounts:",error);
            setError(error);
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
   }

   function handleEdit(account)
   {
      setSelectedAccount(account);
      setShowConfiguration(true);
      setError(null);
   }

   function handleCancel()
   {
      setSelectedAccount(null);
      setShowConfiguration(false);
   }

   async function handleDelete(id)
   {
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
      } catch(error) {
         console.error("Failed to delete SMTP account:",error);
         setError(
            error.message ||
            "Unable to delete SMTP account."
         );
      }
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

            <div className={styles.layout}>
               <aside className={styles.sidebar}>
                  <button
                     className={`${styles.navItem} ${
                        activeSection === "email"
                           ? styles.active
                           : ""
                     }`}
                     onClick={() => setActiveSection("email")}
                  >
                     <span>✉</span>
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
                                 onClick={handleCreate}
                              >
                                 + Add SMTP Account
                              </button>
                           )}
                        </div>

                        {error && (
                           <div className={styles.error}>
                              {error}
                           </div>
                        )}

                        {loading && (
                           <div className={styles.emptySmtp}>
                              <p>
                                 Loading SMTP accounts...
                              </p>
                           </div>
                        )}

                        {!loading && !showConfiguration && smtpAccounts.length === 0 && (
                           <div className={styles.emptySmtp}>
                              <h3>No SMTP accounts</h3>

                              <p>
                                 Add an SMTP account to start sending emails.
                              </p>

                              <button
                                 className={styles.addButton}
                                 onClick={handleCreate}
                              >
                                 + Add SMTP Account
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
                                          onClick={() => handleEdit(account)}
                                       >
                                          Edit
                                       </button>

                                       <button
                                          className={styles.deleteButton}
                                          onClick={() => handleDelete(account.id)}
                                       >
                                          Delete
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