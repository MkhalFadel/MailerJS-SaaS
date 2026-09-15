import { useEffect, useState } from "react";
import {
   getCurrentUser,
   loginUser,
   logoutUser,
   updateCurrentUser
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

   async function updateProfile(profile)
   {
      const response = await updateCurrentUser(profile);

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
            logout,
            updateProfile
         }}
      >
         {children}
      </AuthContext.Provider>
   );
}
