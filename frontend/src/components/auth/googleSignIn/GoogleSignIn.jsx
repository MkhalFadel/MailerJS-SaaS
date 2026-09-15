import { useEffect, useRef, useState } from "react";
import styles from "./googleSignIn.module.css";

const GOOGLE_IDENTITY_SCRIPT_ID = "google-identity-services";
const GOOGLE_IDENTITY_SCRIPT_URL = "https://accounts.google.com/gsi/client";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleSignIn({ onSuccess, onError })
{
   const buttonRef = useRef(null);
   const callbacksRef = useRef({ onSuccess, onError });
   const [error, setError] = useState(null);

   useEffect(() => {
      callbacksRef.current = { onSuccess, onError };
   },[onSuccess, onError]);

   useEffect(() => {
      let cancelled = false;
      let script;

      async function handleCredential(response)
      {
         try {
            if(!response.credential)
               throw new Error("Google did not return a sign-in credential.");

            await callbacksRef.current.onSuccess(response.credential);
         } catch(error) {
            if(cancelled)
               return;

            console.error("Google sign-in failed:", error);
            setError(error.message || "Unable to sign in with Google.");
            callbacksRef.current.onError?.(error);
         }
      }

      function renderGoogleButton()
      {
         if(cancelled || !buttonRef.current || !window.google?.accounts?.id)
            return;

         window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredential
         });
         buttonRef.current.replaceChildren();
         window.google.accounts.id.renderButton(buttonRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "left"
         });
      }

      if(!GOOGLE_CLIENT_ID)
         return undefined;

      function handleScriptError()
      {
         if(!cancelled)
            setError("Google sign-in could not be loaded.");
      }

      script = document.getElementById(GOOGLE_IDENTITY_SCRIPT_ID);

      if(script)
      {
         if(window.google?.accounts?.id)
            renderGoogleButton();
         else
            script.addEventListener("load", renderGoogleButton);
      } else {
         script = document.createElement("script");
         script.id = GOOGLE_IDENTITY_SCRIPT_ID;
         script.src = GOOGLE_IDENTITY_SCRIPT_URL;
         script.async = true;
         script.defer = true;
         script.addEventListener("load", renderGoogleButton);
         script.addEventListener("error", handleScriptError);
         document.head.appendChild(script);
      }

      return () => {
         cancelled = true;
         script?.removeEventListener("load", renderGoogleButton);
         script?.removeEventListener("error", handleScriptError);
      };
   },[]);

   if(!GOOGLE_CLIENT_ID)
   {
      return (
         <p className={styles.error} role="status">
            Google sign-in is not configured.
         </p>
      );
   }

   if(error)
   {
      return (
         <p className={styles.error} role="status">
            {error}
         </p>
      );
   }

   return <div className={styles.button} ref={buttonRef} />;
}

export default GoogleSignIn;
