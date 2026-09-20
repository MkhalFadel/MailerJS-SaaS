const assert = require("node:assert/strict");
const test = require("node:test");

function restoreEnvironmentVariable(name, value)
{
   if(value === undefined)
      delete process.env[name];
   else
      process.env[name] = value;
}

function loadCampaignWorker({
   workers,
   recoverQueuedCampaignSends,
   closeRedisConnection
})
{
   const workerPath = require.resolve("../workers/campaignWorker");
   const bullmqPath = require.resolve("bullmq");
   const prismaPath = require.resolve("../lib/prisma");
   const queuePath = require.resolve("../queues/campaignQueue");
   const redisPath = require.resolve("../queues/redis");
   const sendServicePath = require.resolve("../services/campaignSendService");
   const processorPath = require.resolve("../services/campaignSendProcessor");
   const cachedModules = new Map([
      [workerPath, require.cache[workerPath]],
      [bullmqPath, require.cache[bullmqPath]],
      [prismaPath, require.cache[prismaPath]],
      [queuePath, require.cache[queuePath]],
      [redisPath, require.cache[redisPath]],
      [sendServicePath, require.cache[sendServicePath]],
      [processorPath, require.cache[processorPath]]
   ]);

   class MockWorker
   {
      constructor(queueName, processor, options)
      {
         this.queueName = queueName;
         this.processor = processor;
         this.options = options;
         this.handlers = {};
         this.closed = false;
         workers.push(this);
      }

      on(event, handler)
      {
         this.handlers[event] = handler;
         return this;
      }

      async waitUntilReady()
      {
      }

      async close()
      {
         this.closed = true;
      }
   }

   require.cache[bullmqPath] = {
      exports: {
         Worker: MockWorker
      }
   };
   require.cache[prismaPath] = {
      exports: {
         campaign_sends: {
            findUnique: async () => null
         },
         $disconnect: async () => {
         }
      }
   };
   require.cache[queuePath] = {
      exports: {
         CAMPAIGN_QUEUE_NAME: "campaign-sends",
         closeCampaignQueue: async () => {
         }
      }
   };
   require.cache[redisPath] = {
      exports: {
         createRedisConnection: () => ({ role: "worker" }),
         closeRedisConnection
      }
   };
   require.cache[sendServicePath] = {
      exports: {
         finalizeCampaignSendCancellation: async () => {
         },
         recoverQueuedCampaignSends
      }
   };
   require.cache[processorPath] = {
      exports: {
         markCampaignSendFailed: async () => {
         },
         processCampaignSend: async () => {
         }
      }
   };
   delete require.cache[workerPath];

   return {
      campaignWorker: require(workerPath),
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

test("API worker mode does not start a worker when disabled", async () => {
   const previousValue = process.env.RUN_CAMPAIGN_WORKER_IN_API;
   const runtimePath = require.resolve("../services/campaignWorkerRuntime");
   const cachedRuntime = require.cache[runtimePath];
   let startCount = 0;

   delete process.env.RUN_CAMPAIGN_WORKER_IN_API;
   delete require.cache[runtimePath];

   try {
      const {
         startCampaignWorkerInApiProcess
      } = require(runtimePath);
      const worker = await startCampaignWorkerInApiProcess({
         startWorker: async () => {
            startCount += 1;
         },
         logger: {
            info()
            {
            }
         }
      });

      assert.equal(worker, null);
      assert.equal(startCount, 0);
   } finally {
      restoreEnvironmentVariable(
         "RUN_CAMPAIGN_WORKER_IN_API",
         previousValue
      );

      if(cachedRuntime)
         require.cache[runtimePath] = cachedRuntime;
      else
         delete require.cache[runtimePath];
   }
});

test("API worker mode starts one worker when enabled", async () => {
   const previousValue = process.env.RUN_CAMPAIGN_WORKER_IN_API;
   const runtimePath = require.resolve("../services/campaignWorkerRuntime");
   const cachedRuntime = require.cache[runtimePath];
   const expectedWorker = {};
   let startCount = 0;

   process.env.RUN_CAMPAIGN_WORKER_IN_API = "true";
   delete require.cache[runtimePath];

   try {
      const {
         startCampaignWorkerInApiProcess
      } = require(runtimePath);
      const worker = await startCampaignWorkerInApiProcess({
         startWorker: async () => {
            startCount += 1;
            return expectedWorker;
         },
         logger: {
            info()
            {
            }
         }
      });

      assert.equal(worker, expectedWorker);
      assert.equal(startCount, 1);
   } finally {
      restoreEnvironmentVariable(
         "RUN_CAMPAIGN_WORKER_IN_API",
         previousValue
      );

      if(cachedRuntime)
         require.cache[runtimePath] = cachedRuntime;
      else
         delete require.cache[runtimePath];
   }
});

test("campaign worker starts once, registers the processor, and closes safely", async () => {
   const workers = [];
   let recoveryCount = 0;
   let closedConnection;
   const { campaignWorker, restore } = loadCampaignWorker({
      workers,
      recoverQueuedCampaignSends: async () => {
         recoveryCount += 1;
      },
      closeRedisConnection: async (connection) => {
         closedConnection = connection;
      }
   });

   try {
      const [firstWorker, secondWorker] = await Promise.all([
         campaignWorker.startCampaignWorker(),
         campaignWorker.startCampaignWorker()
      ]);

      assert.equal(firstWorker, secondWorker);
      assert.equal(workers.length, 1);
      assert.equal(workers[0].queueName, "campaign-sends");
      assert.equal(workers[0].options.concurrency, 1);
      assert.equal(typeof workers[0].processor, "function");
      assert.equal(recoveryCount, 1);

      await campaignWorker.closeCampaignWorker();

      assert.equal(workers[0].closed, true);
      assert.deepEqual(closedConnection, { role: "worker" });

      await campaignWorker.closeCampaignWorker();
   } finally {
      await campaignWorker.closeCampaignWorker();
      restore();
   }
});
