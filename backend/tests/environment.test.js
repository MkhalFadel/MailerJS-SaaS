const assert = require("node:assert/strict");
const test = require("node:test");
const {
   getFrontendOrigin,
   validateProductionEnvironment
} = require("../config/environment");

const environmentVariableNames = [
   "NODE_ENV",
   "DATABASE_URL",
   "QUEUE_REDIS_URL",
   "JWT_SECRET",
   "REFRESH_SECRET",
   "FRONTEND_URL",
   "AUTH_COOKIE_SAME_SITE",
   "SMTP_ENCRYPTION_KEY"
];

function saveEnvironment()
{
   return Object.fromEntries(
      environmentVariableNames.map(name => [name, process.env[name]])
   );
}

function restoreEnvironment(environment)
{
   for(const name of environmentVariableNames)
   {
      if(environment[name] === undefined)
         delete process.env[name];
      else
         process.env[name] = environment[name];
   }
}

function setValidProductionEnvironment()
{
   process.env.NODE_ENV = "production";
   process.env.DATABASE_URL = "postgresql://example";
   process.env.QUEUE_REDIS_URL = "redis://127.0.0.1:6379";
   process.env.JWT_SECRET = "access-secret";
   process.env.REFRESH_SECRET = "refresh-secret";
   process.env.FRONTEND_URL = "https://frontend.example.com";
   process.env.AUTH_COOKIE_SAME_SITE = "none";
   process.env.SMTP_ENCRYPTION_KEY = "encryption-key";
}

test("normalizes a configured frontend URL to its CORS origin", () => {
   const environment = saveEnvironment();

   try {
      process.env.FRONTEND_URL = "https://frontend.example.com/";

      assert.equal(getFrontendOrigin(), "https://frontend.example.com");
   } finally {
      restoreEnvironment(environment);
   }
});

test("production configuration rejects missing required variables", () => {
   const environment = saveEnvironment();

   try {
      setValidProductionEnvironment();
      delete process.env.QUEUE_REDIS_URL;

      assert.throws(
         validateProductionEnvironment,
         /QUEUE_REDIS_URL/
      );
   } finally {
      restoreEnvironment(environment);
   }
});

test("production configuration requires cross-site cookie support", () => {
   const environment = saveEnvironment();

   try {
      setValidProductionEnvironment();
      process.env.AUTH_COOKIE_SAME_SITE = "lax";

      assert.throws(
         validateProductionEnvironment,
         /AUTH_COOKIE_SAME_SITE/
      );
   } finally {
      restoreEnvironment(environment);
   }
});
