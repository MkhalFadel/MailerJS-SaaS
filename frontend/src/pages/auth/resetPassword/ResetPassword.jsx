import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../../components/auth/authLayout/AuthLayout";
import styles from "./resetPassword.module.css";

function ResetPassword() {
   const [password,setPassword] = useState("");
   const [confirmPassword,setConfirmPassword] = useState("");
   const [updated,setUpdated] = useState(false);

   function handleSubmit(event) {
      event.preventDefault();
      setUpdated(true);
   }

   if (updated) {
      return (
         <AuthLayout>
            <div className={styles.container}>
               <div className={styles.success}>
                  <div className={styles.successIcon}>
                     ✓
                  </div>

                  <h1>Password updated</h1>

                  <p>
                     Your password has been successfully updated.
                  </p>

                  <Link
                     className={styles.loginButton}
                     to="/login"
                  >
                     Continue to Sign In
                  </Link>
               </div>
            </div>
         </AuthLayout>
      );
   }

   return (
      <AuthLayout>
         <div className={styles.container}>
            <div className={styles.header}>
               <h1>Create a new password</h1>

               <p>
                  Choose a strong password for your account.
               </p>
            </div>

            <form
               className={styles.form}
               onSubmit={handleSubmit}
            >
               <label className={styles.field}>
                  <span>New Password</span>

                  <input
                     type="password"
                     value={password}
                     onChange={(event) => setPassword(event.target.value)}
                     placeholder="Enter new password"
                     required
                  />
               </label>

               <label className={styles.field}>
                  <span>Confirm Password</span>

                  <input
                     type="password"
                     value={confirmPassword}
                     onChange={(event) => setConfirmPassword(event.target.value)}
                     placeholder="Confirm new password"
                     required
                  />
               </label>

               <div className={styles.requirements}>
                  <span>Password requirements</span>

                  <p>• At least 8 characters</p>
                  <p>• Contains uppercase and lowercase letters</p>
                  <p>• Contains at least one number</p>
               </div>

               <button
                  className={styles.submit}
                  type="submit"
               >
                  Reset Password
               </button>
            </form>

            <Link
               className={styles.back}
               to="/login"
            >
               ← Back to Sign In
            </Link>
         </div>
      </AuthLayout>
   );
}

export default ResetPassword;