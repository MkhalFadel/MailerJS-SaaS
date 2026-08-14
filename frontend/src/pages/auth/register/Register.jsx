import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../../components/auth/authLayout/AuthLayout";
import styles from "./register.module.css";

function Register() {
   const [firstName,setFirstName] = useState("");
   const [lastName,setLastName] = useState("");
   const [email,setEmail] = useState("");
   const [password,setPassword] = useState("");
   const [confirmPassword,setConfirmPassword] = useState("");
   const [terms,setTerms] = useState(false);

   function handleSubmit(event) {
      event.preventDefault();

      console.log({
         firstName,
         lastName,
         email,
         password,
         confirmPassword,
         terms
      });
   }

   return (
      <AuthLayout>
         <div className={styles.container}>
            <div className={styles.header}>
               <h1>Create your account</h1>

               <p>
                  Start sending emails with MailerJS.
               </p>
            </div>

            <form
               className={styles.form}
               onSubmit={handleSubmit}
            >
               <div className={styles.nameRow}>
                  <label className={styles.field}>
                     <span>First Name</span>

                     <input
                        type="text"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        placeholder="Fadel"
                        required
                     />
                  </label>

                  <label className={styles.field}>
                     <span>Last Name</span>

                     <input
                        type="text"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        placeholder="Mkahal"
                        required
                     />
                  </label>
               </div>

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
                  <span>Password</span>

                  <input
                     type="password"
                     value={password}
                     onChange={(event) => setPassword(event.target.value)}
                     placeholder="Create a password"
                     required
                  />
               </label>

               <label className={styles.field}>
                  <span>Confirm Password</span>

                  <input
                     type="password"
                     value={confirmPassword}
                     onChange={(event) => setConfirmPassword(event.target.value)}
                     placeholder="Confirm your password"
                     required
                  />
               </label>

               <label className={styles.terms}>
                  <input
                     type="checkbox"
                     checked={terms}
                     onChange={(event) => setTerms(event.target.checked)}
                     required
                  />

                  <span>
                     I agree to the Terms of Service and Privacy Policy.
                  </span>
               </label>

               <button
                  className={styles.submit}
                  type="submit"
               >
                  Create Account
               </button>
            </form>

            <div className={styles.login}>
               <span>
                  Already have an account?
               </span>

               <Link to="/login">
                  Sign in
               </Link>
            </div>
         </div>
      </AuthLayout>
   );
}

export default Register;