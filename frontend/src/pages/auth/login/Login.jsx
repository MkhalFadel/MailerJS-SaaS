import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../../components/auth/authLayout/AuthLayout";
import styles from "./login.module.css";
import { useAuth } from "../../../context/authContext"
import { useNavigate } from "react-router-dom";
import Icon from "../../../components/icons/Icon";
import GoogleSignIn from "../../../components/auth/googleSignIn/GoogleSignIn";
import FeedbackState from "../../../components/feedback/FeedbackState";
import useFeedbackScroll from "../../../hooks/useFeedbackScroll";

function Login() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [remember, setRemember] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
   const [error, setError] = useState(null);
   const [submitting, setSubmitting] = useState(false);
   const [googleSigningIn, setGoogleSigningIn] = useState(false);

   const navigate = useNavigate("");

   const { login, googleLogin } = useAuth();
   const { feedbackRef, requestFeedbackScroll } = useFeedbackScroll(error);

   async function handleSubmit(event) {
      event.preventDefault();

      if(submitting || googleSigningIn)
         return;

      setError(null);
      setSubmitting(true);

      try {
         await login({
            email,
            password
         })

         navigate("/dashboard")
      } catch (error) {
         console.error(error);
         requestFeedbackScroll();
         setError(error.message || "Unable to sign in.");
      } finally {
         setSubmitting(false);
      }
   }

   async function handleGoogleSignIn(credential)
   {
      if(submitting || googleSigningIn)
         return;

      setError(null);
      setGoogleSigningIn(true);

      try {
         await googleLogin(credential);
         navigate("/dashboard");
      } catch(error) {
         console.error("Google sign-in failed:", error);
         requestFeedbackScroll();
         setError(error.message || "Unable to sign in with Google.");
      } finally {
         setGoogleSigningIn(false);
      }
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
               aria-busy={submitting || googleSigningIn}
               className={styles.form}
               onSubmit={handleSubmit}
            >
               {error && (
                  <FeedbackState feedbackRef={feedbackRef} type="error">
                     {error}
                  </FeedbackState>
               )}

               {googleSigningIn && (
                  <FeedbackState type="info">
                     Signing in with Google...
                  </FeedbackState>
               )}

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
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword(!showPassword)}
                     >
                        <Icon name={showPassword ? "eyeOff" : "eye"} size={17} />
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
                  disabled={submitting || googleSigningIn}
                  type="submit"
               >
                  {submitting ? "Signing In..." : "Sign In"}
               </button>

               <div className={styles.divider}>
                  <span>or continue with</span>
               </div>

               <GoogleSignIn
                  disabled={submitting || googleSigningIn}
                  onSuccess={handleGoogleSignIn}
                  onError={(googleError) => {
                     requestFeedbackScroll();
                     setError(googleError.message || "Unable to sign in with Google.");
                  }}
               />
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
