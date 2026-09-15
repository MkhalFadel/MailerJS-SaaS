import { useEffect, useState } from "react";
import {
   getCurrentUser,
   loginUser,
   loginWithGoogle,
   logoutUser,
   updateCurrentUser,
   updatePassword
} from "../api/auth";
import { AuthContext } from "./authContext";

export function AuthProvider({ children })
{
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      async function loadUser()
      {
         try {
            const response = await getCurrentUser();

            setUser(response.data);
         } catch {
            setUser(null);
         } finally {
            setLoading(false);
         }
      }

      loadUser();
   },[]);

   useEffect(() => {
      function handleSessionExpired()
      {
         setUser(null);
         setLoading(false);
      }

      window.addEventListener("auth:session-expired", handleSessionExpired);

      return () => {
         window.removeEventListener("auth:session-expired", handleSessionExpired);
      };
   },[]);

   async function login(credentials)
   {
      const response = await loginUser(credentials);

      setUser(response.user);

      return response;
   }

   async function logout()
   {
      await logoutUser();

      setUser(null);
   }

   async function googleLogin(credential)
   {
      const response = await loginWithGoogle(credential);

      setUser(response.user);

      return response;
   }

   async function updateProfile(profile)
   {
      const response = await updateCurrentUser(profile);

      setUser(response.data);

      return response;
   }

   async function changePassword(password)
   {
      const response = await updatePassword(password);

      setUser(response.data);

      return response;
   }

   return (
      <AuthContext.Provider
         value={{
            user,
            loading,
            isAuthenticated: Boolean(user),
            login,
            googleLogin,
            logout,
            updateProfile,
            changePassword
         }}
      >
         {children}
      </AuthContext.Provider>
   );
}
