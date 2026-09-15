const assert = require("node:assert/strict");
const test = require("node:test");

function createResponse()
{
   return {
      cookies: [],
      clearedCookies: [],
      statusCode: null,
      body: null,
      status(code)
      {
         this.statusCode = code;
         return this;
      },
      json(body)
      {
         this.body = body;
         return this;
      },
      send(body)
      {
         this.body = body;
         return this;
      },
      cookie(name, value, options)
      {
         this.cookies.push({ name, value, options });
         return this;
      },
      clearCookie(name, options)
      {
         this.clearedCookies.push({ name, options });
         return this;
      }
   };
}

function loadAuthController({ prisma, auth = {}, verifyGoogleCredential })
{
   const controllerPath = require.resolve("../controllers/authController");
   const prismaPath = require.resolve("../lib/prisma");
   const authPath = require.resolve("../utils/auth");
   const googleAuthPath = require.resolve("../services/googleAuthService");
   const cachedModules = new Map([
      [controllerPath, require.cache[controllerPath]],
      [prismaPath, require.cache[prismaPath]],
      [authPath, require.cache[authPath]],
      [googleAuthPath, require.cache[googleAuthPath]]
   ]);
   const calls = {
      accessTokens: [],
      authCookies: [],
      clearedCookies: []
   };

   require.cache[prismaPath] = {
      exports: prisma
   };
   require.cache[authPath] = {
      exports: {
         hashPassword: async () => "hashed-password",
         verifyPassword: async () => true,
         updateUsersFields: async () => ({}),
         verifyRefreshToken: () => ({ id: "user-id" }),
         setAuthCookies: (res, user) => {
            calls.authCookies.push(user);
            res.cookie("authToken", "access-token", {});
            res.cookie("refreshToken", "refresh-token", {});
         },
         setAccessTokenCookie: (res, user) => {
            calls.accessTokens.push(user);
            res.cookie("authToken", "new-access-token", {});
         },
         clearAuthCookies: (res) => {
            calls.clearedCookies.push(true);
            res.clearCookie("authToken", {});
            res.clearCookie("refreshToken", {});
         },
         ...auth
      }
   };
   require.cache[googleAuthPath] = {
      exports: {
         verifyGoogleCredential
      }
   };
   delete require.cache[controllerPath];

   const controller = require(controllerPath);

   return {
      controller,
      calls,
      restore()
      {
         for(const [modulePath, cachedModule] of cachedModules)
         {
            if(cachedModule)
               require.cache[modulePath] = cachedModule;
            else
               delete require.cache[modulePath];
         }
      }
   };
}

function createPrisma(user = null)
{
   return {
      users: {
         findUnique: async () => user,
         findFirst: async () => user,
         create: async ({ data }) => ({
            id: "new-user-id",
            created_at: new Date(),
            updated_at: new Date(),
            ...data
         })
      }
   };
}

test("valid refresh issues a new access cookie even when the access token is expired", async (context) => {
   const user = {
      id: "user-id",
      email: "user@example.com"
   };
   const authModule = loadAuthController({
      prisma: createPrisma(user),
      verifyGoogleCredential: async () => null
   });
   context.after(() => authModule.restore());
   const response = createResponse();

   await authModule.controller.updateAccessToken({
      cookies: {
         authToken: "expired-access-token",
         refreshToken: "valid-refresh-token"
      }
   }, response);

   assert.equal(response.statusCode, 200);
   assert.equal(authModule.calls.accessTokens.length, 1);
   assert.deepEqual(authModule.calls.accessTokens[0], user);
   assert.equal(response.cookies[0].name, "authToken");
});

test("missing, invalid, and expired refresh tokens are rejected and clear cookies", async () => {
   const scenarios = [
      {
         name: "missing",
         cookies: {},
         auth: {}
      },
      {
         name: "invalid",
         cookies: { refreshToken: "invalid-refresh-token" },
         auth: {
            verifyRefreshToken: () => {
               throw new Error("invalid token");
            }
         }
      },
      {
         name: "expired",
         cookies: { refreshToken: "expired-refresh-token" },
         auth: {
            verifyRefreshToken: () => {
               const error = new Error("expired token");
               error.name = "TokenExpiredError";
               throw error;
            }
         }
      }
   ];

   for(const scenario of scenarios)
   {
      const authModule = loadAuthController({
         prisma: createPrisma(),
         auth: scenario.auth,
         verifyGoogleCredential: async () => null
      });
      const response = createResponse();

      await authModule.controller.updateAccessToken({
         cookies: scenario.cookies
      }, response);

      assert.equal(response.statusCode, 401, scenario.name);
      assert.equal(response.clearedCookies.length, 2, scenario.name);
      authModule.restore();
   }
});

test("refresh rejects a token for a deleted user", async (context) => {
   const authModule = loadAuthController({
      prisma: createPrisma(),
      verifyGoogleCredential: async () => null
   });
   context.after(() => authModule.restore());
   const response = createResponse();

   await authModule.controller.updateAccessToken({
      cookies: {
         refreshToken: "valid-refresh-token"
      }
   }, response);

   assert.equal(response.statusCode, 401);
   assert.equal(response.body.code, "REFRESH_TOKEN_INVALID");
   assert.equal(response.clearedCookies.length, 2);
});

test("logout clears both authentication cookies and refresh cannot resume the session", async (context) => {
   const authModule = loadAuthController({
      prisma: createPrisma(),
      verifyGoogleCredential: async () => null
   });
   context.after(() => authModule.restore());
   const logoutResponse = createResponse();

   authModule.controller.logout({}, logoutResponse);

   assert.equal(logoutResponse.statusCode, 200);
   assert.deepEqual(
      logoutResponse.clearedCookies.map(cookie => cookie.name),
      ["authToken", "refreshToken"]
   );

   const refreshResponse = createResponse();
   await authModule.controller.updateAccessToken({ cookies: {} }, refreshResponse);

   assert.equal(refreshResponse.statusCode, 401);
});

test("a verified Google identity creates a Google-only user and issues MailerJS cookies", async (context) => {
   const createdUsers = [];
   const prisma = {
      users: {
         findUnique: async () => null,
         findFirst: async () => null,
         create: async ({ data }) => {
            createdUsers.push(data);
            return {
               id: "new-google-user",
               created_at: new Date(),
               updated_at: new Date(),
               ...data
            };
         }
      }
   };
   const authModule = loadAuthController({
      prisma,
      verifyGoogleCredential: async () => ({
         sub: "google-subject",
         email: "Google.User@example.com",
         email_verified: true,
         given_name: "Google",
         family_name: "User"
      })
   });
   context.after(() => authModule.restore());
   const response = createResponse();

   await authModule.controller.googleLogin({
      body: {
         credential: "verified-google-id-token"
      }
   }, response, assert.fail);

   assert.equal(response.statusCode, 200);
   assert.deepEqual(createdUsers, [{
      email: "google.user@example.com",
      google_id: "google-subject",
      first_name: "Google",
      last_name: "User"
   }]);
   assert.equal(authModule.calls.authCookies.length, 1);
   assert.equal(response.body.user.password_hash, undefined);
   assert.equal(response.body.user.hasPassword, false);
});

test("an existing linked Google user signs in without creating a duplicate", async (context) => {
   const linkedUser = {
      id: "linked-user-id",
      email: "user@example.com",
      google_id: "google-subject",
      first_name: "Google",
      last_name: "User",
      password_hash: null
   };
   let created = false;
   const authModule = loadAuthController({
      prisma: {
         users: {
            findUnique: async ({ where }) => where.google_id
               ? linkedUser
               : null,
            findFirst: async () => null,
            create: async () => {
               created = true;
            }
         }
      },
      verifyGoogleCredential: async () => ({
         sub: "google-subject",
         email: "user@example.com",
         email_verified: true
      })
   });
   context.after(() => authModule.restore());
   const response = createResponse();

   await authModule.controller.googleLogin({
      body: { credential: "verified-google-id-token" }
   }, response, assert.fail);

   assert.equal(response.statusCode, 200);
   assert.equal(created, false);
   assert.equal(authModule.calls.authCookies[0].id, "linked-user-id");
});

test("invalid Google identities and local-email collisions are rejected safely", async (context) => {
   const invalidAuthModule = loadAuthController({
      prisma: createPrisma(),
      verifyGoogleCredential: async () => {
         const error = new Error("wrong audience");
         error.code = "GOOGLE_AUTH_INVALID";
         throw error;
      }
   });
   context.after(() => invalidAuthModule.restore());
   const invalidResponse = createResponse();

   await invalidAuthModule.controller.googleLogin({
      body: { credential: "wrong-audience-token" }
   }, invalidResponse, assert.fail);

   assert.equal(invalidResponse.statusCode, 401);

   let createCalled = false;
   let emailLookup;
   const collisionAuthModule = loadAuthController({
      prisma: {
         users: {
            findUnique: async ({ where }) => where.google_id
               ? null
               : null,
            findFirst: async (query) => {
               emailLookup = query;

               return {
                  id: "local-user-id",
                  email: "Local@Example.com"
               };
            },
            create: async () => {
               createCalled = true;
            }
         }
      },
      verifyGoogleCredential: async () => ({
         sub: "unlinked-google-subject",
         email: "local@example.com",
         email_verified: true
      })
   });
   context.after(() => collisionAuthModule.restore());
   const collisionResponse = createResponse();

   await collisionAuthModule.controller.googleLogin({
      body: { credential: "verified-google-id-token" }
   }, collisionResponse, assert.fail);

   assert.equal(collisionResponse.statusCode, 409);
   assert.equal(createCalled, false);
   assert.deepEqual(emailLookup, {
      where: {
         email: {
            equals: "local@example.com",
            mode: "insensitive"
         }
      }
   });
});

test("Google-only users receive the same generic password-login failure", async (context) => {
   let verifyPasswordCalled = false;
   const authModule = loadAuthController({
      prisma: createPrisma({
         id: "google-only-user",
         email: "google@example.com",
         password_hash: null
      }),
      auth: {
         verifyPassword: async () => {
            verifyPasswordCalled = true;
            return true;
         }
      },
      verifyGoogleCredential: async () => null
   });
   context.after(() => authModule.restore());
   const response = createResponse();

   await authModule.controller.login({
      body: {
         email: "google@example.com",
         password: "password"
      }
   }, response, assert.fail);

   assert.equal(response.statusCode, 401);
   assert.equal(verifyPasswordCalled, false);
});

test("safe user responses expose hasPassword without exposing password hashes", async (context) => {
   const user = {
      id: "password-user-id",
      email: "user@example.com",
      password_hash: "secret-hash",
      google_id: "connected-google-subject",
      first_name: "Password",
      last_name: "User"
   };
   const authModule = loadAuthController({
      prisma: createPrisma(user),
      verifyGoogleCredential: async () => null
   });
   context.after(() => authModule.restore());
   const response = createResponse();

   await authModule.controller.fetchUser({
      user: {
         id: user.id
      }
   }, response, assert.fail);

   assert.equal(response.statusCode, 200);
   assert.equal(response.body.data.hasPassword, true);
   assert.equal(response.body.data.password_hash, undefined);
});

test("password users can change their password without disconnecting Google", async (context) => {
   const user = {
      id: "password-user-id",
      email: "user@example.com",
      password_hash: "old-password-hash",
      google_id: "connected-google-subject",
      first_name: "Password",
      last_name: "User"
   };
   let hashedPassword;
   let updateData;
   const authModule = loadAuthController({
      prisma: {
         users: {
            findUnique: async () => user,
            update: async ({ data }) => {
               updateData = data;

               return {
                  ...user,
                  ...data
               };
            }
         }
      },
      auth: {
         hashPassword: async (password) => {
            hashedPassword = password;
            return "new-password-hash";
         },
         verifyPassword: async (password, storedHash) => (
            password === "CurrentPass1" && storedHash === "old-password-hash"
         )
      },
      verifyGoogleCredential: async () => {
         throw new Error("Google verification should not run for password users");
      }
   });
   context.after(() => authModule.restore());
   const response = createResponse();

   await authModule.controller.updatePassword({
      user: {
         id: user.id
      },
      body: {
         currentPassword: "CurrentPass1",
         newPassword: "NewPassword1",
         confirmPassword: "NewPassword1"
      }
   }, response, assert.fail);

   assert.equal(response.statusCode, 200);
   assert.equal(hashedPassword, "NewPassword1");
   assert.deepEqual(updateData, {
      password_hash: "new-password-hash"
   });
   assert.equal(response.body.data.hasPassword, true);
   assert.equal(response.body.data.password_hash, undefined);
   assert.equal(response.body.data.google_id, "connected-google-subject");
});

test("password changes reject weak, mismatched, and incorrect current passwords", async (context) => {
   const user = {
      id: "password-user-id",
      email: "user@example.com",
      password_hash: "old-password-hash"
   };
   let updateCalled = false;
   const authModule = loadAuthController({
      prisma: {
         users: {
            findUnique: async () => user,
            update: async () => {
               updateCalled = true;
            }
         }
      },
      auth: {
         verifyPassword: async () => false
      },
      verifyGoogleCredential: async () => null
   });
   context.after(() => authModule.restore());

   const scenarios = [
      {
         body: {
            currentPassword: "CurrentPass1",
            newPassword: "weak",
            confirmPassword: "weak"
         },
         error: "Password must contain at least 8 characters"
      },
      {
         body: {
            currentPassword: "CurrentPass1",
            newPassword: "NewPassword1",
            confirmPassword: "DifferentPass1"
         },
         error: "New password and confirmation do not match"
      },
      {
         body: {
            currentPassword: "WrongPass1",
            newPassword: "NewPassword1",
            confirmPassword: "NewPassword1"
         },
         error: "Current password is incorrect"
      }
   ];

   for(const scenario of scenarios)
   {
      const response = createResponse();

      await authModule.controller.updatePassword({
         user: {
            id: user.id
         },
         body: scenario.body
      }, response, assert.fail);

      assert.equal(response.statusCode, 400);
      assert.equal(response.body.error, scenario.error);
   }

   assert.equal(updateCalled, false);
});

test("Google-only users must reauthenticate with their matching Google subject to set a password", async (context) => {
   const user = {
      id: "google-user-id",
      email: "google@example.com",
      password_hash: null,
      google_id: "connected-google-subject",
      first_name: "Google",
      last_name: "User"
   };
   let verifiedCredential;
   let updateData;
   const authModule = loadAuthController({
      prisma: {
         users: {
            findUnique: async () => user,
            update: async ({ data }) => {
               updateData = data;

               return {
                  ...user,
                  ...data
               };
            }
         }
      },
      auth: {
         hashPassword: async () => "first-password-hash",
         verifyPassword: async () => {
            throw new Error("Current password verification should not run");
         }
      },
      verifyGoogleCredential: async (credential) => {
         verifiedCredential = credential;

         return {
            sub: "connected-google-subject",
            email: "google@example.com",
            email_verified: true
         };
      }
   });
   context.after(() => authModule.restore());
   const response = createResponse();

   await authModule.controller.updatePassword({
      user: {
         id: user.id
      },
      body: {
         newPassword: "NewPassword1",
         confirmPassword: "NewPassword1",
         googleCredential: "fresh-google-id-token"
      }
   }, response, assert.fail);

   assert.equal(response.statusCode, 200);
   assert.equal(verifiedCredential, "fresh-google-id-token");
   assert.deepEqual(updateData, {
      password_hash: "first-password-hash"
   });
   assert.equal(response.body.data.hasPassword, true);
   assert.equal(response.body.data.google_id, "connected-google-subject");
});

test("Google-only password setup rejects invalid or mismatched Google reauthentication", async (context) => {
   const user = {
      id: "google-user-id",
      password_hash: null,
      google_id: "connected-google-subject"
   };
   let updateCalled = false;
   const authModule = loadAuthController({
      prisma: {
         users: {
            findUnique: async () => user,
            update: async () => {
               updateCalled = true;
            }
         }
      },
      verifyGoogleCredential: async (credential) => {
         if(credential === "invalid-token")
         {
            const error = new Error("invalid credential");
            error.code = "GOOGLE_AUTH_INVALID";
            throw error;
         }

         return {
            sub: "another-google-subject",
            email: "other@example.com",
            email_verified: true
         };
      }
   });
   context.after(() => authModule.restore());

   const invalidResponse = createResponse();
   await authModule.controller.updatePassword({
      user: { id: user.id },
      body: {
         newPassword: "NewPassword1",
         confirmPassword: "NewPassword1",
         googleCredential: "invalid-token"
      }
   }, invalidResponse, assert.fail);

   assert.equal(invalidResponse.statusCode, 401);

   const mismatchResponse = createResponse();
   await authModule.controller.updatePassword({
      user: { id: user.id },
      body: {
         newPassword: "NewPassword1",
         confirmPassword: "NewPassword1",
         googleCredential: "other-account-token"
      }
   }, mismatchResponse, assert.fail);

   assert.equal(mismatchResponse.statusCode, 403);
   assert.equal(updateCalled, false);
});

test("Google reauthentication confirms only the Google subject linked to the session user", async (context) => {
   const authModule = loadAuthController({
      prisma: {
         users: {
            findUnique: async () => ({
               google_id: "connected-google-subject"
            })
         }
      },
      verifyGoogleCredential: async (credential) => {
         assert.equal(credential, "fresh-google-id-token");

         return {
            sub: "connected-google-subject",
            email: "different-email@example.com",
            email_verified: true
         };
      }
   });
   context.after(() => authModule.restore());
   const response = createResponse();

   await authModule.controller.verifyGoogleReauthentication({
      user: {
         id: "current-user-id"
      },
      body: {
         credential: "fresh-google-id-token"
      }
   }, response, assert.fail);

   assert.equal(response.statusCode, 200);
   assert.deepEqual(response.body, {
      verified: true
   });
});

test("Google reauthentication rejects missing, invalid, unlinked, and mismatched identities", async (context) => {
   let verifyCalled = false;
   const missingCredentialModule = loadAuthController({
      prisma: createPrisma(),
      verifyGoogleCredential: async () => {
         verifyCalled = true;
      }
   });
   context.after(() => missingCredentialModule.restore());
   const missingResponse = createResponse();

   await missingCredentialModule.controller.verifyGoogleReauthentication({
      user: { id: "current-user-id" },
      body: {}
   }, missingResponse, assert.fail);

   assert.equal(missingResponse.statusCode, 400);
   assert.equal(verifyCalled, false);

   const invalidCredentialModule = loadAuthController({
      prisma: createPrisma(),
      verifyGoogleCredential: async () => {
         const error = new Error("invalid credential");
         error.code = "GOOGLE_AUTH_INVALID";
         throw error;
      }
   });
   context.after(() => invalidCredentialModule.restore());
   const invalidResponse = createResponse();

   await invalidCredentialModule.controller.verifyGoogleReauthentication({
      user: { id: "current-user-id" },
      body: { credential: "invalid-token" }
   }, invalidResponse, assert.fail);

   assert.equal(invalidResponse.statusCode, 401);

   const unlinkedModule = loadAuthController({
      prisma: {
         users: {
            findUnique: async () => ({
               google_id: null
            })
         }
      },
      verifyGoogleCredential: async () => ({
         sub: "google-subject",
         email: "user@example.com",
         email_verified: true
      })
   });
   context.after(() => unlinkedModule.restore());
   const unlinkedResponse = createResponse();

   await unlinkedModule.controller.verifyGoogleReauthentication({
      user: { id: "current-user-id" },
      body: { credential: "valid-token" }
   }, unlinkedResponse, assert.fail);

   assert.equal(unlinkedResponse.statusCode, 400);

   const mismatchModule = loadAuthController({
      prisma: {
         users: {
            findUnique: async () => ({
               google_id: "connected-google-subject"
            })
         }
      },
      verifyGoogleCredential: async () => ({
         sub: "another-google-subject",
         email: "current-user@example.com",
         email_verified: true
      })
   });
   context.after(() => mismatchModule.restore());
   const mismatchResponse = createResponse();

   await mismatchModule.controller.verifyGoogleReauthentication({
      user: { id: "current-user-id" },
      body: { credential: "another-account-token" }
   }, mismatchResponse, assert.fail);

   assert.equal(mismatchResponse.statusCode, 403);
   assert.equal(
      mismatchResponse.body.error,
      "Please verify using the Google account connected to this MailerJS account."
   );
});

test("Google reauthentication route is protected by the existing authentication middleware", () => {
   const authRouter = require("../routes/authRoutes");
   const authMiddleware = require("../middleware/authMiddleware");
   const route = authRouter.stack.find(
      layer => layer.route?.path === "/google/reauthenticate"
   );

   assert.equal(route.route.stack[0].handle, authMiddleware);
});
