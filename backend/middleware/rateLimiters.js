const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const {
   logRateLimitStoreError,
   sendRateLimitRedisCommand
} = require("../queues/rateLimitRedis");

const RATE_LIMIT_REDIS_PREFIX = "mailerjs:ratelimit:";
let loggedMissingRedisConfiguration = false;

function isTestEnvironment()
{
   return process.env.NODE_ENV === "test" || process.argv.includes("--test");
}

function isRateLimitingEnabled()
{
   return process.env.RATE_LIMIT_ENABLED !== "false";
}

function getPositiveInteger(value, fallback)
{
   const parsedValue = Number.parseInt(value, 10);

   return Number.isSafeInteger(parsedValue) && parsedValue > 0
      ? parsedValue
      : fallback;
}

function getIpKey(request)
{
   return `ip:${ipKeyGenerator(request.ip)}`;
}

function getAuthenticatedUserKey(request)
{
   if(request.user?.id)
      return `user:${request.user.id}`;

   return getIpKey(request);
}

function createRateLimitStore(name)
{
   if(isTestEnvironment() || !isRateLimitingEnabled())
      return undefined;

   if(!process.env.QUEUE_REDIS_URL)
   {
      if(!loggedMissingRedisConfiguration)
      {
         console.warn(
            "QUEUE_REDIS_URL is not configured; rate limiting is using per-process memory storage."
         );
         loggedMissingRedisConfiguration = true;
      }

      return undefined;
   }

   return new RedisStore({
      prefix: `${RATE_LIMIT_REDIS_PREFIX}${name}:`,
      sendCommand: sendRateLimitRedisCommand
   });
}

function createRateLimiter({
   name,
   windowMs,
   limit,
   message,
   keyGenerator = getIpKey,
   skipSuccessfulRequests = false
})
{
   return rateLimit({
      windowMs,
      limit,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      identifier: name,
      keyGenerator,
      skipSuccessfulRequests,
      passOnStoreError: true,
      store: createRateLimitStore(name),
      skip: (request) => (
         request.method === "OPTIONS" || !isRateLimitingEnabled()
      ),
      logger: {
         error(error)
         {
            logRateLimitStoreError(error);
         },
         warn()
         {
         }
      },
      handler: (request, response, next, options) => {
         response.status(options.statusCode).json({
            error: message
         });
      }
   });
}

const rateLimitPolicies = {
   general: {
      windowMs: getPositiveInteger(
         process.env.RATE_LIMIT_GENERAL_WINDOW_MS,
         15 * 60 * 1000
      ),
      limit: getPositiveInteger(process.env.RATE_LIMIT_GENERAL_LIMIT, 600)
   },
   login: {
      windowMs: 15 * 60 * 1000,
      limit: 10
   },
   registration: {
      windowMs: 60 * 60 * 1000,
      limit: 5
   },
   googleAuth: {
      windowMs: 15 * 60 * 1000,
      limit: 15
   },
   refresh: {
      windowMs: 15 * 60 * 1000,
      limit: 60
   },
   googleReauthentication: {
      windowMs: 15 * 60 * 1000,
      limit: 10
   },
   sensitiveAccount: {
      windowMs: 15 * 60 * 1000,
      limit: 5
   },
   smtpTest: {
      windowMs: 10 * 60 * 1000,
      limit: 15
   },
   campaignSend: {
      windowMs: 60 * 60 * 1000,
      limit: 20
   },
   campaignCancel: {
      windowMs: 15 * 60 * 1000,
      limit: 30
   }
};

const generalApiLimiter = createRateLimiter({
   name: "general",
   ...rateLimitPolicies.general,
   message: "Too many requests. Please try again later."
});

const loginLimiter = createRateLimiter({
   name: "login",
   ...rateLimitPolicies.login,
   message: "Too many login attempts. Please try again later.",
   skipSuccessfulRequests: true
});

const registrationLimiter = createRateLimiter({
   name: "registration",
   ...rateLimitPolicies.registration,
   message: "Too many registration attempts. Please try again later."
});

const googleAuthLimiter = createRateLimiter({
   name: "google-auth",
   ...rateLimitPolicies.googleAuth,
   message: "Too many Google sign-in attempts. Please try again later."
});

const refreshLimiter = createRateLimiter({
   name: "refresh",
   ...rateLimitPolicies.refresh,
   message: "Too many token refresh requests. Please try again later."
});

const googleReauthenticationLimiter = createRateLimiter({
   name: "google-reauthentication",
   ...rateLimitPolicies.googleReauthentication,
   message: "Too many Google reauthentication attempts. Please try again later.",
   keyGenerator: getAuthenticatedUserKey
});

const sensitiveAccountLimiter = createRateLimiter({
   name: "sensitive-account",
   ...rateLimitPolicies.sensitiveAccount,
   message: "Too many sensitive account requests. Please try again later.",
   keyGenerator: getAuthenticatedUserKey
});

const smtpTestLimiter = createRateLimiter({
   name: "smtp-test",
   ...rateLimitPolicies.smtpTest,
   message: "Too many connection tests. Please wait before trying again.",
   keyGenerator: getAuthenticatedUserKey
});

const campaignSendLimiter = createRateLimiter({
   name: "campaign-send",
   ...rateLimitPolicies.campaignSend,
   message: "Too many campaign send requests. Please try again later.",
   keyGenerator: getAuthenticatedUserKey
});

const campaignCancelLimiter = createRateLimiter({
   name: "campaign-cancel",
   ...rateLimitPolicies.campaignCancel,
   message: "Too many campaign cancellation requests. Please try again later.",
   keyGenerator: getAuthenticatedUserKey
});

module.exports = {
   campaignCancelLimiter,
   campaignSendLimiter,
   generalApiLimiter,
   getAuthenticatedUserKey,
   getIpKey,
   googleAuthLimiter,
   googleReauthenticationLimiter,
   loginLimiter,
   rateLimitPolicies,
   refreshLimiter,
   registrationLimiter,
   sensitiveAccountLimiter,
   smtpTestLimiter
};
