import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../../components/auth/authLayout/AuthLayout";
import styles from "./login.module.css";

function Login() {
   const [email,setEmail] = useState("");
   const [password,setPassword] = useState("");
   const [remember,setRemember] = useState(false);
   const [showPassword,setShowPassword] = useState(false);

   function handleSubmit(event) {
      event.preventDefault();

      console.log({
         email,
         password,
         remember
      });
   }

   return (
      <AuthLayout>
         <div className={styles.container}>
            <div className={styles.header}>
               <h1>Welcome back</h1>

               <p>
                  Sign in to your MailerJS account.
               </p>
            </div>

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

               <label className={styles.field}>
                  <div className={styles.labelRow}>
                     <span>Password</span>

                     <Link to="/forgot-password">
                        Forgot password?
                     </Link>
                  </div>

                  <div className={styles.passwordWrapper}>
                     <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        required
                     />

                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                     >
                        {showPassword ? "Hide" : "Show"}
                     </button>
                  </div>
               </label>

               <label className={styles.remember}>
                  <input
                     type="checkbox"
                     checked={remember}
                     onChange={(event) => setRemember(event.target.checked)}
                  />

                  <span>
                     Remember me
                  </span>
               </label>

               <button
                  className={styles.submit}
                  type="submit"
               >
                  Sign In
               </button>
            </form>

            <div className={styles.signup}>
               <span>
                  Don't have an account?
               </span>

               <Link to="/register">
                  Create one
               </Link>
            </div>
         </div>
      </AuthLayout>
   );
}

export default Login;