const IORedis = require("ioredis");

let rateLimitRedisConnection;
let loggedConnectionError = false;
let loggedStoreError = false;

function logRateLimitStoreError(error)
{
   if(loggedStoreError)
      return;

   console.error("Rate-limit Redis store error:", error.message);
   loggedStoreError = true;
}

function getRateLimitRedisConnection()
{
   if(rateLimitRedisConnection)
      return rateLimitRedisConnection;

   const redisUrl = process.env.QUEUE_REDIS_URL;

   if(!redisUrl)
      throw new Error("QUEUE_REDIS_URL is not defined");

   rateLimitRedisConnection = new IORedis(redisUrl, {
      enableReadyCheck: false,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      retryStrategy(times)
      {
         return Math.min(times * 200, 2000);
      }
   });

   rateLimitRedisConnection.on("error", (error) => {
      if(loggedConnectionError)
         return;

      console.error("Rate-limit Redis connection error:", error.message);
      loggedConnectionError = true;
   });

   rateLimitRedisConnection.on("ready", () => {
      loggedConnectionError = false;
      loggedStoreError = false;
   });

   return rateLimitRedisConnection;
}

async function sendRateLimitRedisCommand(...command)
{
   try {
      return await getRateLimitRedisConnection().call(...command);
   } catch(error) {
      logRateLimitStoreError(error);
      throw error;
   }
}

async function closeRateLimitRedisConnection()
{
   if(!rateLimitRedisConnection)
      return;

   try {
      await rateLimitRedisConnection.quit();
   } catch(error) {
      rateLimitRedisConnection.disconnect();
   }

   rateLimitRedisConnection = null;
}

module.exports = {
   closeRateLimitRedisConnection,
   logRateLimitStoreError,
   sendRateLimitRedisCommand
};
