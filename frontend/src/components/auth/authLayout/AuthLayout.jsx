import styles from "./authLayout.module.css";
import mailerjsMark from "../../../assets/brand/mailerjsMark.svg";

function AuthLayout({ children }) {
   return (
      <div className={styles.container}>
         <aside className={styles.brandPanel}>
            <div className={styles.brand}>
               <img alt="" aria-hidden="true" className={styles.logoMark} src={mailerjsMark} />
               <span className={styles.wordmark}>
                  Mailer<span className={styles.wordmarkAccent}>JS</span>
               </span>
            </div>

            <div className={styles.brandMessage}>
               <span>Campaign delivery workspace</span>
               <h1>Send better email, with a clearer view of every campaign.</h1>
               <p>
                  Build your audience, prepare campaigns, and follow SMTP acceptance from one focused workspace.
               </p>
            </div>

            <div aria-hidden="true" className={styles.signalGrid}>
               <span />
               <span />
               <span />
               <span />
               <span />
               <span />
            </div>
         </aside>

         <main className={styles.content}>
            <div className={styles.mobileBrand}>
               <div className={styles.mobileLockup}>
                  <img alt="" aria-hidden="true" className={styles.logoMark} src={mailerjsMark} />
                  <span className={styles.mobileWordmark}>
                     Mailer<span className={styles.wordmarkAccent}>JS</span>
                  </span>
               </div>
            </div>

            <div className={styles.formArea}>
               {children}
            </div>

            <p className={styles.footer}>
               © 2026 MailerJS. All rights reserved.
            </p>
         </main>
      </div>
   );
}

export default AuthLayout;
