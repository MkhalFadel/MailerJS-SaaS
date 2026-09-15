import apiRequest from "./api";

export function registerUser(user)
{
   return apiRequest("/users/register",{
      method: "POST",
      body: JSON.stringify(user)
   });
}

export function loginUser(credentials)
{
   return apiRequest("/users/login",{
      method: "POST",
      body: JSON.stringify(credentials)
   });
}

export function getCurrentUser()
{
   return apiRequest("/users/");
}

export function refreshAccessToken()
{
   return apiRequest("/users/refresh",{
      method: "POST"
   });
}

export function loginWithGoogle(credential)
{
   return apiRequest("/users/google",{
      method: "POST",
      body: JSON.stringify({ credential })
   });
}

export function verifyGoogleReauthentication(credential)
{
   return apiRequest("/users/google/reauthenticate",{
      method: "POST",
      body: JSON.stringify({ credential })
   });
}

export function updateCurrentUser(user)
{
   return apiRequest("/users/update",{
      method: "PUT",
      body: JSON.stringify(user)
   });
}

export function updatePassword(password)
{
   return apiRequest("/users/password",{
      method: "PATCH",
      body: JSON.stringify(password)
   });
}

export function logoutUser()
{
   return apiRequest("/users/logout",{
      method: "POST"
   });
}

export function deleteUser()
{
   return apiRequest('/users/delete/', {
      method: 'DELETE'
   });
}
