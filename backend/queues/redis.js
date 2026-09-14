const IORedis = require("ioredis");

function createRedisConnection(role)
{
   const redisUrl = process.env.QUEUE_REDIS_URL;

   if(!redisUrl)
      throw new Error("QUEUE_REDIS_URL is not defined");

   const connection = new IORedis(redisUrl, {
      enableReadyCheck: false,
      lazyConnect: true,
      maxRetriesPerRequest: role === "worker" ? null : 1,
      connectTimeout: 5000,
      retryStrategy(times)
      {
         return Math.min(times * 200, 2000);
      }
   });

   let loggedError = false;

   connection.on("error", (error) => {
      if(loggedError)
         return;

      console.error("Campaign queue Redis connection error:", error.message);
      loggedError = true;
   });

   connection.on("ready", () => {
      loggedError = false;
   });

   return connection;
}

async function closeRedisConnection(connection)
{
   if(!connection)
      return;

   try {
      await connection.quit();
   } catch(error) {
      connection.disconnect();
   }
}

module.exports = { createRedisConnection, closeRedisConnection };
