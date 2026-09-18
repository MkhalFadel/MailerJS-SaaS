import { useState } from "react";
import AuthLayout from "../../../components/auth/authLayout/AuthLayout";
import styles from "./forgetPassword.module.css";
import Icon from "../../../components/icons/Icon";
import BackButton from "../../../components/navigation/BackButton";

function ForgetPassword() {
   const [email,setEmail] = useState("");
   const [submitted,setSubmitted] = useState(false);

   function handleSubmit(event) {
      event.preventDefault();
      setSubmitted(true);
   }

   return (
      <AuthLayout>
         <div className={styles.container}>
            <div className={styles.icon}>
               <Icon name="campaign" size={23} />
            </div>

            <div className={styles.header}>
               <h1>Forgot your password?</h1>

               <p>
                  Enter your email and we'll send you a link to reset your password.
               </p>
            </div>

            {!submitted ? (
               <form
                  className={styles.form}
                  onSubmit={handleSubmit}
               >
                  <label className={styles.field}>
                     <span>Email</span>

                     <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        required
                     />
                  </label>

                  <button
                     className={styles.submit}
                     type="submit"
                  >
                     Send Reset Link
                  </button>
               </form>
            ) : (
               <div className={styles.success}>
                  <div className={styles.successIcon}>
                     <Icon name="check" size={21} />
                  </div>

                  <h2>Check your inbox</h2>

                  <p>
                     If an account exists for {email}, we've sent instructions
                     to reset your password.
                  </p>
               </div>
            )}

            <BackButton centered to="/login">
               Back to Sign In
            </BackButton>
         </div>
      </AuthLayout>
   );
}

export default ForgetPassword;
