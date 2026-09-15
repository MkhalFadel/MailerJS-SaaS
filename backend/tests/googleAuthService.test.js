const assert = require("node:assert/strict");
const test = require("node:test");

function loadGoogleAuthService(verifyIdToken)
{
   const servicePath = require.resolve("../services/googleAuthService");
   const libraryPath = require.resolve("google-auth-library");
   const cachedService = require.cache[servicePath];
   const cachedLibrary = require.cache[libraryPath];
   const originalClientId = process.env.GOOGLE_CLIENT_ID;
   let constructedClientId;
   let verificationOptions;

   class OAuth2Client {
      constructor(clientId)
      {
         constructedClientId = clientId;
      }

      async verifyIdToken(options)
      {
         verificationOptions = options;
         return verifyIdToken(options);
      }
   }

   process.env.GOOGLE_CLIENT_ID = "google-client-id";
   require.cache[libraryPath] = {
      exports: {
         OAuth2Client
      }
   };
   delete require.cache[servicePath];

   const service = require(servicePath);

   return {
      service,
      getVerification: () => ({
         constructedClientId,
         verificationOptions
      }),
      restore()
      {
         if(originalClientId === undefined)
            delete process.env.GOOGLE_CLIENT_ID;
         else
            process.env.GOOGLE_CLIENT_ID = originalClientId;

         if(cachedService)
            require.cache[servicePath] = cachedService;
         else
            delete require.cache[servicePath];

         if(cachedLibrary)
            require.cache[libraryPath] = cachedLibrary;
         else
            delete require.cache[libraryPath];
      }
   };
}

test("Google credentials are verified against the configured client audience", async (context) => {
   const googleModule = loadGoogleAuthService(async () => ({
      getPayload: () => ({
         sub: "google-subject",
         email: "user@example.com",
         email_verified: true
      })
   }));
   context.after(() => googleModule.restore());

   const profile = await googleModule.service.verifyGoogleCredential("google-id-token");
   const verification = googleModule.getVerification();

   assert.equal(profile.sub, "google-subject");
   assert.equal(verification.constructedClientId, "google-client-id");
   assert.deepEqual(verification.verificationOptions, {
      idToken: "google-id-token",
      audience: "google-client-id"
   });
});

test("Google verification rejects invalid audiences and identities without verified email", async (context) => {
   const invalidAudienceModule = loadGoogleAuthService(async () => {
      throw new Error("wrong audience");
   });
   context.after(() => invalidAudienceModule.restore());

   await assert.rejects(
      invalidAudienceModule.service.verifyGoogleCredential("wrong-audience-token"),
      error => error.code === "GOOGLE_AUTH_INVALID"
   );

   const invalidEmailModule = loadGoogleAuthService(async () => ({
      getPayload: () => ({
         sub: "google-subject",
         email: "user@example.com",
         email_verified: false
      })
   }));
   context.after(() => invalidEmailModule.restore());

   await assert.rejects(
      invalidEmailModule.service.verifyGoogleCredential("unverified-email-token"),
      error => error.code === "GOOGLE_AUTH_INVALID"
   );
});
