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