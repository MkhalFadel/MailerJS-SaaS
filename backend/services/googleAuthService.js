const { OAuth2Client } = require("google-auth-library");

let googleClient;

function createGoogleAuthError(message, code)
{
   const error = new Error(message);
   error.code = code;
   return error;
}

function getGoogleClient()
{
   if(!googleClient)
      googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

   return googleClient;
}

async function verifyGoogleCredential(credential)
{
   if(!process.env.GOOGLE_CLIENT_ID)
   {
      throw createGoogleAuthError(
         "Google sign-in is not configured",
         "GOOGLE_AUTH_NOT_CONFIGURED"
      );
   }

   if(!credential)
   {
      throw createGoogleAuthError(
         "Google credential is required",
         "GOOGLE_AUTH_INVALID"
      );
   }

   try {
      const ticket = await getGoogleClient().verifyIdToken({
         idToken: credential,
         audience: process.env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();

      if(!payload?.sub || !payload.email || payload.email_verified !== true)
      {
         throw createGoogleAuthError(
            "Google account email must be verified",
            "GOOGLE_AUTH_INVALID"
         );
      }

      return payload;
   } catch(error) {
      if(error.code?.startsWith("GOOGLE_AUTH_"))
         throw error;

      throw createGoogleAuthError(
         "Google credential could not be verified",
         "GOOGLE_AUTH_INVALID"
      );
   }
}

module.exports = { verifyGoogleCredential };
