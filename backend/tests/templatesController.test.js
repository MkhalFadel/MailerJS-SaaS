const assert = require("node:assert/strict");
const test = require("node:test");
const { validationResult } = require("express-validator");
const {
   templatesValidator,
   templatesUpdateValidator
} = require("../validators/templatesValidator");

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

function loadTemplatesController(prisma)
{
   const controllerPath = require.resolve("../controllers/templatesController");
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

async function getValidationErrors(validator, body)
{
   const request = { body };

   for(const validation of validator)
      await validation.run(request);

   return validationResult(request).array();
}

test("templates are created with reusable content and no subject", async (context) => {
   let createdData;
   const controllerModule = loadTemplatesController({
      templates: {
         create: async ({ data }) => {
            createdData = data;
            return {
               id: "template-id",
               ...data
            };
         }
      }
   });
   context.after(() => controllerModule.restore());
   const response = createResponse();

   await controllerModule.controller.createTemplate({
      body: {
         name: "Welcome",
         content: "<p>Hello {{first_name}}</p>"
      },
      user: {
         id: "user-id"
      }
   }, response, assert.fail);

   assert.equal(response.statusCode, 201);
   assert.deepEqual(createdData, {
      user_id: "user-id",
      name: "Welcome",
      content: "<p>Hello {{first_name}}</p>"
   });
   assert.equal(Object.hasOwn(response.body.data, "subject"), false);
});

test("template updates retain the subject-free template data model", async (context) => {
   let updatedData;
   const controllerModule = loadTemplatesController({
      templates: {
         findFirst: async () => ({ id: "template-id" }),
         update: async ({ data }) => {
            updatedData = data;
            return {
               id: "template-id",
               ...data
            };
         }
      }
   });
   context.after(() => controllerModule.restore());
   const response = createResponse();

   await controllerModule.controller.updateTemplate({
      params: {
         id: "template-id"
      },
      body: {
         content: "<p>Updated content</p>"
      },
      user: {
         id: "user-id"
      }
   }, response, assert.fail);

   assert.equal(response.statusCode, 200);
   assert.deepEqual(updatedData, {
      content: "<p>Updated content</p>"
   });
   assert.equal(Object.hasOwn(response.body.data, "subject"), false);
});

test("template endpoints reject the removed subject field", async () => {
   const createErrors = await getValidationErrors(templatesValidator, {
      name: "Welcome",
      subject: "Legacy subject",
      content: "<p>Hello</p>"
   });
   const updateErrors = await getValidationErrors(templatesUpdateValidator, {
      subject: "Legacy subject"
   });

   assert.equal(
      createErrors.some((error) => error.path === "subject"),
      true
   );
   assert.equal(
      updateErrors.some((error) => error.path === "subject"),
      true
   );
});
