import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../../components/auth/authLayout/AuthLayout";
import styles from "./register.module.css";
import { registerUser } from "../../../api/auth";
import { useNavigate } from "react-router-dom";
import FeedbackState from "../../../components/feedback/FeedbackState";
import useFeedbackScroll from "../../../hooks/useFeedbackScroll";

function Register() {
   const [firstName,setFirstName] = useState("");
   const [lastName,setLastName] = useState("");
   const [email,setEmail] = useState("");
   const [password,setPassword] = useState("");
   const [confirmPassword,setConfirmPassword] = useState("");
   const [terms,setTerms] = useState(false);
   const [error, setError] = useState(null);
   const [submitting, setSubmitting] = useState(false);

   const navigate = useNavigate();
   const { feedbackRef, requestFeedbackScroll } = useFeedbackScroll(error);

   async function handleSubmit(event) {
      event.preventDefault();

      if(submitting)
         return;

      setError(null);
      setSubmitting(true);

      try {
         await registerUser({
            email,
            firstName,
            lastName,
            password
         })
         
         navigate("/login")
      } catch (error) {
         console.error(error);
         requestFeedbackScroll();
         setError(error.message || "Unable to create your account.");
      } finally {
         setSubmitting(false);
      }
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
               aria-busy={submitting}
               className={styles.form}
               onSubmit={handleSubmit}
            >
               {error && (
                  <FeedbackState feedbackRef={feedbackRef} type="error">
                     {error}
                  </FeedbackState>
               )}

               <div className={styles.nameRow}>
                  <label className={styles.field}>
                     <span>First Name</span>

                     <input
                        type="text"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        placeholder="Fadel"
                        required
                        disabled={submitting}
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
                        disabled={submitting}
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
                     disabled={submitting}
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
                     disabled={submitting}
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
                     disabled={submitting}
                  />
               </label>

               <label className={styles.terms}>
                  <input
                     type="checkbox"
                     checked={terms}
                     onChange={(event) => setTerms(event.target.checked)}
                     required
                     disabled={submitting}
                  />

                  <span>
                     I agree to the Terms of Service and Privacy Policy.
                  </span>
               </label>

               <button
                  className={styles.submit}
                  disabled={submitting}
                  type="submit"
               >
                  {submitting ? "Creating Account..." : "Create Account"}
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
