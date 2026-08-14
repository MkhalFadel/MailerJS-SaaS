import styles from "./authLayout.module.css";

function AuthLayout({ children }) {
   return (
      <div className={styles.container}>
         <div className={styles.brand}>
            <div className={styles.logo}>
               M
            </div>

            <span>MailerJS</span>
         </div>

         <main className={styles.content}>
            {children}
         </main>

         <p className={styles.footer}>
            © 2026 MailerJS. All rights reserved.
         </p>
      </div>
   );
}

export default AuthLayout;