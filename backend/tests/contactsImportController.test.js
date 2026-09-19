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
      }
   };
}

function loadContactsController(prisma)
{
   const controllerPath = require.resolve("../controllers/contactsController");
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

function createRequest(contacts)
{
   return {
      body: {
         contacts
      },
      user: {
         id: "user-id"
      }
   };
}

test("importContacts creates valid contacts with optional names and skips invalid duplicates", async (context) => {
   let createdContacts;
   let existingContactsQuery;
   const controllerModule = loadContactsController({
      contacts: {
         findMany: async (query) => {
            existingContactsQuery = query;
            return [{ email: "existing@example.com" }];
         },
         createMany: async ({ data }) => {
            createdContacts = data;
            return { count: data.length };
         }
      }
   });
   context.after(() => controllerModule.restore());
   const response = createResponse();

   await controllerModule.controller.importContacts(
      createRequest([
         {
            email: "Ada@Example.com",
            firstName: "Ada",
            lastName: "Lovelace"
         },
         {
            email: "text-file@example.com"
         },
         {
            email: "not-an-email"
         },
         {
            email: "ada@example.com"
         },
         {
            email: "existing@example.com"
         }
      ]),
      response,
      assert.fail
   );

   assert.equal(response.statusCode, 200);
   assert.deepEqual(existingContactsQuery.where, {
      user_id: "user-id",
      email: {
         in: ["ada@example.com", "text-file@example.com", "existing@example.com"]
      }
   });
   assert.deepEqual(createdContacts, [
      {
         user_id: "user-id",
         email: "ada@example.com",
         first_name: "Ada",
         last_name: "Lovelace"
      },
      {
         user_id: "user-id",
         email: "text-file@example.com",
         first_name: null,
         last_name: null
      }
   ]);
   assert.deepEqual(response.body.data, {
      total: 5,
      imported: 2,
      invalid: 1,
      duplicates: 2,
      skipped: 3
   });
});

test("importContacts rejects files without valid email addresses", async (context) => {
   let queriedContacts = false;
   const controllerModule = loadContactsController({
      contacts: {
         findMany: async () => {
            queriedContacts = true;
            return [];
         },
         createMany: async () => {
            assert.fail("Invalid contacts must not be created");
         }
      }
   });
   context.after(() => controllerModule.restore());
   const response = createResponse();

   await controllerModule.controller.importContacts(
      createRequest([{ email: "invalid" }, { email: "" }]),
      response,
      assert.fail
   );

   assert.equal(response.statusCode, 400);
   assert.equal(queriedContacts, false);
   assert.match(response.body.error, /no valid email/i);
});
