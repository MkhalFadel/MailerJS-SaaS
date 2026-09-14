const assert = require("node:assert/strict");
const test = require("node:test");

function loadDashboardService(prisma)
{
   const servicePath = require.resolve("../services/dashboardService");
   const prismaPath = require.resolve("../lib/prisma");
   const cachedModules = new Map([
      [servicePath, require.cache[servicePath]],
      [prismaPath, require.cache[prismaPath]]
   ]);

   require.cache[prismaPath] = {
      exports: prisma
   };
   delete require.cache[servicePath];

   const service = require(servicePath);

   return {
      service,
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

function createPrisma({
   totalContacts = 0,
   totalCampaigns = 0,
   totalTemplates = 0,
   totalSmtpAccounts = 0,
   acceptedEmails = 0,
   failedEmails = 0,
   campaigns = []
} = {})
{
   const queries = {
      contacts: [],
      campaigns: [],
      templates: [],
      smtpAccounts: [],
      deliveries: [],
      recentCampaigns: null
   };

   return {
      contacts: {
         count: async ({ where }) => {
            queries.contacts.push(where);
            return totalContacts;
         }
      },
      campaigns: {
         count: async ({ where }) => {
            queries.campaigns.push(where);
            return totalCampaigns;
         },
         findMany: async (query) => {
            queries.recentCampaigns = query;
            return campaigns;
         }
      },
      templates: {
         count: async ({ where }) => {
            queries.templates.push(where);
            return totalTemplates;
         }
      },
      smtp_accounts: {
         count: async ({ where }) => {
            queries.smtpAccounts.push(where);
            return totalSmtpAccounts;
         }
      },
      campaign_deliveries: {
         count: async ({ where }) => {
            queries.deliveries.push(where);
            return where.status === "accepted"
               ? acceptedEmails
               : failedEmails;
         }
      },
      getQueries: () => queries
   };
}

test("getDashboard returns only the current user's aggregate data and newest sends", async (context) => {
   const newestSend = {
      id: "send-newest",
      status: "COMPLETED_WITH_ERRORS",
      total_recipients: 10,
      accepted_count: 8,
      failed_count: 2,
      created_at: new Date("2026-09-15T11:00:00.000Z"),
      started_at: new Date("2026-09-15T11:01:00.000Z"),
      completed_at: new Date("2026-09-15T11:02:00.000Z")
   };
   const prisma = createPrisma({
      totalContacts: 7,
      totalCampaigns: 6,
      totalTemplates: 3,
      totalSmtpAccounts: 2,
      acceptedEmails: 12,
      failedEmails: 3,
      campaigns: [
         {
            id: "campaign-recent",
            name: "September update",
            subject: "Your September news",
            created_at: new Date("2026-09-15T10:00:00.000Z"),
            _count: {
               recipients: 10
            },
            sends: [newestSend]
         },
         {
            id: "campaign-unsent",
            name: "Draft campaign",
            subject: "Coming soon",
            created_at: new Date("2026-09-14T10:00:00.000Z"),
            _count: {
               recipients: 0
            },
            sends: []
         }
      ]
   });
   const dashboardModule = loadDashboardService(prisma);
   context.after(() => dashboardModule.restore());

   const dashboard = await dashboardModule.service.getDashboard("user-a");
   const queries = prisma.getQueries();

   assert.deepEqual(dashboard.stats, {
      total_contacts: 7,
      total_campaigns: 6,
      total_templates: 3,
      total_smtp_accounts: 2,
      accepted_emails: 12,
      failed_emails: 3,
      success_rate: 80
   });
   assert.equal(dashboard.recent_campaigns.length, 2);
   assert.equal(dashboard.recent_campaigns[0].latest_send.id, "send-newest");
   assert.equal(
      dashboard.recent_campaigns[0].latest_send.status,
      "COMPLETED_WITH_ERRORS"
   );
   assert.equal(dashboard.recent_campaigns[1].latest_send, null);

   assert.deepEqual(queries.contacts, [{ user_id: "user-a" }]);
   assert.deepEqual(queries.campaigns, [{ user_id: "user-a" }]);
   assert.deepEqual(queries.templates, [{ user_id: "user-a" }]);
   assert.deepEqual(queries.smtpAccounts, [{ user_id: "user-a" }]);
   assert.equal(queries.recentCampaigns.where.user_id, "user-a");
   assert.equal(queries.recentCampaigns.take, 5);
   assert.deepEqual(queries.recentCampaigns.orderBy, {
      created_at: "desc"
   });
   assert.equal(queries.recentCampaigns.select.sends.take, 1);
   assert.deepEqual(queries.recentCampaigns.select.sends.orderBy, {
      created_at: "desc"
   });

   for(const deliveryQuery of queries.deliveries)
   {
      assert.equal(
         deliveryQuery.OR[0].campaign_send.campaign.user_id,
         "user-a"
      );
      assert.equal(
         deliveryQuery.OR[1].campaign_recipient.campaign.user_id,
         "user-a"
      );
   }
});

test("getDashboard returns a valid empty-account dashboard", async (context) => {
   const dashboardModule = loadDashboardService(createPrisma());
   context.after(() => dashboardModule.restore());

   const dashboard = await dashboardModule.service.getDashboard("new-user");

   assert.deepEqual(dashboard, {
      stats: {
         total_contacts: 0,
         total_campaigns: 0,
         total_templates: 0,
         total_smtp_accounts: 0,
         accepted_emails: 0,
         failed_emails: 0,
         success_rate: 0
      },
      recent_campaigns: []
   });
});

test("dashboard route uses the existing authentication middleware", () => {
   const dashboardRouter = require("../routes/dashboardRoutes");
   const authMiddleware = require("../middleware/authMiddleware");
   const dashboardRoute = dashboardRouter.stack.find(
      layer => layer.route?.path === "/"
   );
   let statusCode;
   let responseBody;
   let nextCalled = false;
   const response = {
      status(code)
      {
         statusCode = code;
         return this;
      },
      json(body)
      {
         responseBody = body;
      }
   };

   assert.equal(dashboardRoute.route.stack[0].handle, authMiddleware);

   authMiddleware(
      {
         cookies: {}
      },
      response,
      () => {
         nextCalled = true;
      }
   );

   assert.equal(statusCode, 401);
   assert.deepEqual(responseBody, {
      message: "Unauthorized token"
   });
   assert.equal(nextCalled, false);
});
