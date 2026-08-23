import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser, logoutUser } from "../api/auth";

const AuthContext = createContext(null);

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
         } catch(error) {
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

   return (
      <AuthContext.Provider
         value={{
            user,
            loading,
            isAuthenticated: Boolean(user),
            login,
            logout
         }}
      >
         {children}
      </AuthContext.Provider>
   );
}

export function useAuth()
{
   return useContext(AuthContext);
}