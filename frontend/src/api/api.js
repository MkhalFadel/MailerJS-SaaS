const API_URL = import.meta.env.VITE_API_URL;

async function apiRequest(endpoint, options = {})
{
   const response = await fetch(`${API_URL}${endpoint}`,{
      ...options,
      credentials: "include",
      headers: {
         "Content-Type": "application/json",
         ...options.headers
      }
   });

   const data = await response.json().catch(() => null);

   if(!response.ok)
   {
      const error = new Error(
         data?.error ||
         data?.message ||
         "Something went wrong"
      );

      error.status = response.status;
      error.data = data;

      throw error;
   }

   return data;
}

export default apiRequest;