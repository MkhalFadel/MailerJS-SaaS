const API_URL = import.meta.env.VITE_API_URL;
let refreshPromise = null;

function createApiError(response, data)
{
   const error = new Error(
      data?.error ||
      data?.message ||
      "Something went wrong"
   );

   error.status = response.status;
   error.data = data;

   return error;
}

function isAccessTokenFailure(response, data)
{
   return response.status === 401 && data?.code?.startsWith("ACCESS_TOKEN_");
}

function notifySessionExpired()
{
   if(typeof window !== "undefined")
      window.dispatchEvent(new Event("auth:session-expired"));
}

async function requestAccessTokenRefresh()
{
   const response = await fetch(`${API_URL}/users/refresh`,{
      method: "POST",
      credentials: "include",
      headers: {
         "Content-Type": "application/json"
      }
   });
   const data = await response.json().catch(() => null);

   if(!response.ok)
      throw createApiError(response, data);

   return data;
}

function refreshAccessToken()
{
   if(!refreshPromise)
   {
      refreshPromise = requestAccessTokenRefresh().finally(() => {
         refreshPromise = null;
      });
   }

   return refreshPromise;
}

async function apiRequest(endpoint, options = {}, requestOptions = {})
{
   const { hasRetried = false } = requestOptions;
   const response = await fetch(`${API_URL}${endpoint}`,{
      ...options,
      credentials: "include",
      headers: {
         "Content-Type": "application/json",
         ...options.headers
      }
   });

   const data = await response.json().catch(() => null);

   if(isAccessTokenFailure(response, data))
   {
      if(!hasRetried)
      {
         try {
            await refreshAccessToken();

            return apiRequest(endpoint, options, {
               hasRetried: true
            });
         } catch {
            notifySessionExpired();
         }
      } else {
         notifySessionExpired();
      }
   }

   if(!response.ok)
      throw createApiError(response, data);

   return data;
}

export default apiRequest;
