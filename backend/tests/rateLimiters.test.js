const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const test = require("node:test");

const {
   campaignCancelLimiter,
   campaignSendLimiter,
   generalApiLimiter,
   googleAuthLimiter,
   googleReauthenticationLimiter,
   loginLimiter,
   rateLimitPolicies,
   refreshLimiter,
   registrationLimiter,
   sensitiveAccountLimiter,
   smtpTestLimiter
} = require("../middleware/rateLimiters");

function createResponse()
{
   const response = new EventEmitter();
   const headers = new Map();

   response.statusCode = 200;
   response.headersSent = false;
   response.writableEnded = false;
   response.setHeader = (name, value) => {
      headers.set(name.toLowerCase(), value);
   };
   response.getHeader = (name) => headers.get(name.toLowerCase());
   response.append = (name, value) => {
      const currentValue = response.getHeader(name);
      const values = currentValue
         ? [].concat(currentValue, value)
         : [value];

      response.setHeader(name, values);
   };
   response.status = (statusCode) => {
      response.statusCode = statusCode;
      return response;
   };
   response.json = (body) => {
      response.body = body;
      response.headersSent = true;
      response.writableEnded = true;
      response.emit("finish");
      return response;
   };

   return response;
}

async function request(limiter, options = {})
{
   const request = {
      ip: options.ip || "198.51.100.10",
      method: options.method || "POST"
   };
   const response = createResponse();

   if(options.userId)
   {
      request.user = {
         id: options.userId
      };
   }

   await new Promise((resolve, reject) => {
      response.once("finish", resolve);
      limiter(request, response, (error) => {
         if(error)
         {
            reject(error);
            return;
         }

         response.status(options.responseStatus || 200).json({ ok: true });
      });
   });

   await new Promise((resolve) => setImmediate(resolve));

   return {
      status: response.statusCode,
      data: response.body,
      rateLimit: response.getHeader("ratelimit")
   };
}

async function expectAllowedRequests(limiter, count, options)
{
   for(let index = 0; index < count; index += 1)
   {
      const response = await request(limiter, options);
      assert.notEqual(response.status, 429);
   }
}

test("rate-limit policies use the intended generous and sensitive limits", () => {
   assert.deepEqual(rateLimitPolicies.general, {
      windowMs: 15 * 60 * 1000,
      limit: 600
   });
   assert.equal(rateLimitPolicies.login.limit, 10);
   assert.equal(rateLimitPolicies.registration.limit, 5);
   assert.equal(rateLimitPolicies.googleAuth.limit, 15);
   assert.equal(rateLimitPolicies.googleReauthentication.limit, 10);
   assert.equal(rateLimitPolicies.refresh.limit, 60);
   assert.equal(rateLimitPolicies.sensitiveAccount.limit, 5);
   assert.equal(rateLimitPolicies.smtpTest.limit, 15);
   assert.equal(rateLimitPolicies.campaignSend.limit, 20);
   assert.equal(rateLimitPolicies.campaignCancel.limit, 30);
});

test("anonymous authentication endpoints return useful 429 responses", async () => {
   await expectAllowedRequests(loginLimiter, 10, {
      ip: "198.51.100.11",
      responseStatus: 401
   });
   const limitedLogin = await request(loginLimiter, {
      ip: "198.51.100.11",
      responseStatus: 401
   });
   assert.equal(limitedLogin.status, 429);
   assert.equal(limitedLogin.data.error, "Too many login attempts. Please try again later.");
   assert.ok(limitedLogin.rateLimit);

   await expectAllowedRequests(loginLimiter, 10, {
      ip: "198.51.100.12"
   });
   await expectAllowedRequests(loginLimiter, 10, {
      ip: "198.51.100.12",
      responseStatus: 401
   });
   assert.equal(
      (await request(loginLimiter, {
         ip: "198.51.100.12",
         responseStatus: 401
      })).status,
      429
   );

   await expectAllowedRequests(registrationLimiter, 5, {
      ip: "198.51.100.13",
      responseStatus: 201
   });
   assert.equal(
      (await request(registrationLimiter, {
         ip: "198.51.100.13",
         responseStatus: 201
      })).status,
      429
   );

   await expectAllowedRequests(googleAuthLimiter, 15, {
      ip: "198.51.100.14"
   });
   assert.equal(
      (await request(googleAuthLimiter, {
         ip: "198.51.100.14"
      })).status,
      429
   );
});

test("authenticated limiters are isolated by user and protect costly actions", async () => {
   await expectAllowedRequests(googleReauthenticationLimiter, 10, {
      userId: "google-user"
   });
   assert.equal(
      (await request(googleReauthenticationLimiter, {
         userId: "google-user"
      })).status,
      429
   );

   await expectAllowedRequests(sensitiveAccountLimiter, 5, {
      userId: "first-user"
   });
   assert.equal(
      (await request(sensitiveAccountLimiter, {
         userId: "first-user"
      })).status,
      429
   );
   assert.equal(
      (await request(sensitiveAccountLimiter, {
         userId: "second-user"
      })).status,
      200
   );

   await expectAllowedRequests(smtpTestLimiter, 15, {
      userId: "smtp-user"
   });
   assert.equal(
      (await request(smtpTestLimiter, {
         userId: "smtp-user"
      })).status,
      429
   );

   await expectAllowedRequests(campaignSendLimiter, 20, {
      userId: "campaign-user"
   });
   assert.equal(
      (await request(campaignSendLimiter, {
         userId: "campaign-user"
      })).status,
      429
   );

   await expectAllowedRequests(campaignCancelLimiter, 30, {
      userId: "cancel-user"
   });
   assert.equal(
      (await request(campaignCancelLimiter, {
         userId: "cancel-user"
      })).status,
      429
   );
});

test("refresh, campaign polling, and OPTIONS requests remain usable", async () => {
   assert.equal(
      (await request(refreshLimiter, {
         ip: "198.51.100.15"
      })).status,
      200
   );

   const optionsResponse = await request(generalApiLimiter, {
      method: "OPTIONS",
      ip: "198.51.100.16",
      responseStatus: 204
   });
   assert.equal(optionsResponse.status, 204);
   assert.equal(optionsResponse.rateLimit, undefined);

   await expectAllowedRequests(generalApiLimiter, 25, {
      method: "GET",
      ip: "198.51.100.16"
   });
});
