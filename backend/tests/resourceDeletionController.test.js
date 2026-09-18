const assert = require("node:assert/strict");
const test = require("node:test");

function createResponse()
{
   return {
      body: null,
      statusCode: null,
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
      }
   };
}

function loadController(controllerName, prisma)
{
   const controllerPath = require.resolve(`../controllers/${controllerName}`);
   const prismaPath = require.resolve("../lib/prisma");
   const cachedModules = new Map([
      [controllerPath, require.cache[controllerPath]],
      [prismaPath, require.cache[prismaPath]]
   ]);

   require.cache[prismaPath] = {
      exports: prisma
   };
   delete require.cache[controllerPath];

   return {
      controller: require(controllerPath),
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

function createRequest(query = {})
{
   return {
      params: {
         id: "resource-id"
      },
      query,
      user: {
         id: "user-id"
      }
   };
}

test("unused contacts delete without confirmation", async (context) => {
   let deletedId;
   const controllerModule = loadController("contactsController", {
      contacts: {
         findFirst: async () => ({ id: "resource-id" }),
         delete: async ({ where }) => {
            deletedId = where.id;
         }
      },
      campaign_recipients: {
         count: async () => 0
      }
   });
   context.after(() => controllerModule.restore());
   const response = createResponse();

   await controllerModule.controller.deleteContact(
      createRequest(),
      response,
      assert.fail
   );

   assert.equal(response.statusCode, 204);
   assert.equal(deletedId, "resource-id");
});

test("used contacts require confirmation and confirmed deletion removes only that contact", async (context) => {
   let deletedId;
   const controllerModule = loadController("contactsController", {
      contacts: {
         findFirst: async () => ({ id: "resource-id" }),
         delete: async ({ where }) => {
            deletedId = where.id;
         }
      },
      campaign_recipients: {
         count: async () => 2
      }
   });
   context.after(() => controllerModule.restore());
   const confirmationResponse = createResponse();

   await controllerModule.controller.deleteContact(
      createRequest(),
      confirmationResponse,
      assert.fail
   );

   assert.equal(confirmationResponse.statusCode, 409);
   assert.equal(confirmationResponse.body.requiresConfirmation, true);
   assert.equal(confirmationResponse.body.campaignCount, 2);
   assert.equal(deletedId, undefined);

   const confirmedResponse = createResponse();
   await controllerModule.controller.deleteContact(
      createRequest({ confirm: "true" }),
      confirmedResponse,
      assert.fail
   );

   assert.equal(confirmedResponse.statusCode, 204);
   assert.equal(deletedId, "resource-id");
});

test("contact deletion does not inspect another user's contact", async (context) => {
   let counted = false;
   const controllerModule = loadController("contactsController", {
      contacts: {
         findFirst: async () => null
      },
      campaign_recipients: {
         count: async () => {
            counted = true;
            return 0;
         }
      }
   });
   context.after(() => controllerModule.restore());
   const response = createResponse();

   await controllerModule.controller.deleteContact(
      createRequest(),
      response,
      assert.fail
   );

   assert.equal(response.statusCode, 404);
   assert.equal(counted, false);
});

test("unused templates delete without confirmation", async (context) => {
   let deletedId;
   const controllerModule = loadController("templatesController", {
      templates: {
         findFirst: async () => ({ id: "resource-id" }),
         delete: async ({ where }) => {
            deletedId = where.id;
         }
      },
      campaigns: {
         count: async () => 0
      },
      campaign_sends: {
         count: async () => 0
      }
   });
   context.after(() => controllerModule.restore());
   const response = createResponse();

   await controllerModule.controller.deleteTemplate(
      createRequest(),
      response,
      assert.fail
   );

   assert.equal(response.statusCode, 204);
   assert.equal(deletedId, "resource-id");
});

test("used templates require confirmation before deletion", async (context) => {
   let deleted = false;
   const controllerModule = loadController("templatesController", {
      templates: {
         findFirst: async () => ({ id: "resource-id" }),
         delete: async () => {
            deleted = true;
         }
      },
      campaigns: {
         count: async () => 3
      },
      campaign_sends: {
         count: async () => 0
      }
   });
   context.after(() => controllerModule.restore());
   const confirmationResponse = createResponse();

   await controllerModule.controller.deleteTemplate(
      createRequest(),
      confirmationResponse,
      assert.fail
   );

   assert.equal(confirmationResponse.statusCode, 409);
   assert.equal(confirmationResponse.body.requiresConfirmation, true);
   assert.equal(confirmationResponse.body.campaignCount, 3);
   assert.equal(deleted, false);

   const confirmedResponse = createResponse();
   await controllerModule.controller.deleteTemplate(
      createRequest({ confirm: "true" }),
      confirmedResponse,
      assert.fail
   );

   assert.equal(confirmedResponse.statusCode, 204);
   assert.equal(deleted, true);
});

test("templates used by active sends cannot be deleted", async (context) => {
   let deleted = false;
   const controllerModule = loadController("templatesController", {
      templates: {
         findFirst: async () => ({ id: "resource-id" }),
         delete: async () => {
            deleted = true;
         }
      },
      campaigns: {
         count: async () => 1
      },
      campaign_sends: {
         count: async () => 1
      }
   });
   context.after(() => controllerModule.restore());
   const response = createResponse();

   await controllerModule.controller.deleteTemplate(
      createRequest({ confirm: "true" }),
      response,
      assert.fail
   );

   assert.equal(response.statusCode, 409);
   assert.match(response.body.error, /active campaign send/i);
   assert.equal(deleted, false);
});

test("template deletion does not inspect another user's template", async (context) => {
   let counted = false;
   const controllerModule = loadController("templatesController", {
      templates: {
         findFirst: async () => null
      },
      campaigns: {
         count: async () => {
            counted = true;
            return 0;
         }
      },
      campaign_sends: {
         count: async () => 0
      }
   });
   context.after(() => controllerModule.restore());
   const response = createResponse();

   await controllerModule.controller.deleteTemplate(
      createRequest(),
      response,
      assert.fail
   );

   assert.equal(response.statusCode, 404);
   assert.equal(counted, false);
});
