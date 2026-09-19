const prisma = require("../lib/prisma");
const { updateContactsFields } = require("../utils/contacts");

const MAX_IMPORTED_CONTACTS = 1000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeImportedContact(contact)
{
   const email = typeof contact?.email === "string"
      ? contact.email.trim().toLowerCase()
      : "";

   if(!email || !emailPattern.test(email) || email.length > 255)
      return null;

   const firstName = typeof contact.firstName === "string"
      ? contact.firstName.trim().slice(0, 100)
      : "";
   const lastName = typeof contact.lastName === "string"
      ? contact.lastName.trim().slice(0, 100)
      : "";

   return {
      email,
      first_name: firstName || null,
      last_name: lastName || null
   };
}

async function fetchContacts(req, res, next)
{
   try {
      const userId = req.user.id
   
      const contacts = await prisma.contacts.findMany({
         where: {
            user_id: userId
         },
      })

      return res.status(200).json({
         message: "Contacts fetched!",
         data: contacts
      })
   } catch (error) {
      next(error)
   }
}

async function createContact(req, res, next)
{
   try {
      const user_id = req.user.id;
      const data = req.body;
   
      const contact = await prisma.contacts.create({
         data: {
            user_id,
            email: data.email,
            first_name: data.firstName,
            last_name: data.lastName
         }
      });

      return res.status(201).json({
         message: "Contact created successfully",
         data: contact
      })

   } catch (error) {
      next(error)
   }
}

async function importContacts(req, res, next)
{
   try {
      const importedContacts = req.body.contacts;

      if(!Array.isArray(importedContacts) || importedContacts.length === 0)
      {
         return res.status(400).json({
            error: "Choose a file containing at least one contact."
         });
      }

      if(importedContacts.length > MAX_IMPORTED_CONTACTS)
      {
         return res.status(400).json({
            error: `A single import can contain up to ${MAX_IMPORTED_CONTACTS} contacts.`
         });
      }

      const contactsByEmail = new Map();
      let invalidCount = 0;
      let duplicateInFileCount = 0;

      for(const importedContact of importedContacts)
      {
         const contact = normalizeImportedContact(importedContact);

         if(!contact)
         {
            invalidCount += 1;
            continue;
         }

         if(contactsByEmail.has(contact.email))
         {
            duplicateInFileCount += 1;
            continue;
         }

         contactsByEmail.set(contact.email, contact);
      }

      const contacts = [...contactsByEmail.values()];

      if(contacts.length === 0)
      {
         return res.status(400).json({
            error: "No valid email addresses were found in this file."
         });
      }

      const existingContacts = await prisma.contacts.findMany({
         where: {
            user_id: req.user.id,
            email: {
               in: contacts.map(contact => contact.email)
            }
         },
         select: {
            email: true
         }
      });
      const existingEmails = new Set(
         existingContacts.map(contact => contact.email.toLowerCase())
      );
      const contactsToCreate = contacts.filter(
         contact => !existingEmails.has(contact.email)
      );
      const result = contactsToCreate.length > 0
         ? await prisma.contacts.createMany({
            data: contactsToCreate.map((contact) => ({
               ...contact,
               user_id: req.user.id
            })),
            skipDuplicates: true
         })
         : { count: 0 };
      const duplicateCount =
         duplicateInFileCount +
         existingEmails.size +
         (contactsToCreate.length - result.count);

      return res.status(200).json({
         message: `${result.count} contact${result.count === 1 ? "" : "s"} imported successfully.`,
         data: {
            total: importedContacts.length,
            imported: result.count,
            invalid: invalidCount,
            duplicates: duplicateCount,
            skipped: invalidCount + duplicateCount
         }
      });
   } catch(error) {
      next(error);
   }
}

async function updateContact(req, res, next)
{
   try {
      const userId = req.user.id;
      const { id } = req.params;
      const data = req.body;
      const fields = updateContactsFields(data);

      if(Object.keys(fields).length === 0)
         return res.status(400).json({
            error: "No fields to update"
         });

      const contact = await prisma.contacts.findFirst({
         where: {
            id,
            user_id: userId
         }
      });
      
      if(!contact)
         return res.status(404).json({
            error: "Contact not found"
         });

      const updatedContact = await prisma.contacts.update({
         where: {
            id: contact.id
         },

         data: fields
      });

      return res.status(200).json({
         message: "Contact updated successfully",
         data: updatedContact
      });

   } catch (error) {
      next(error)
   }
}

async function deleteContact(req, res, next)
{
   try {
      const userId = req.user.id;
      const { id } = req.params;
      const confirmed = req.query.confirm === "true";

      const contact = await prisma.contacts.findFirst({
         where: {
            id,
            user_id: userId
         }
      });

      if(!contact)
      {
         return res.status(404).json({
            error: "Contact not found"
         });
      }

      const campaignCount = await prisma.campaign_recipients.count({
         where: {
            contact_id: contact.id,
            campaign: {
               user_id: userId
            }
         }
      });

      if(campaignCount > 0 && !confirmed)
      {
         return res.status(409).json({
            error: "This contact is used by one or more campaigns. Confirm deletion to remove it from those recipient lists.",
            requiresConfirmation: true,
            campaignCount
         });
      }

      await prisma.contacts.delete({
         where: {
            id: contact.id
         }
      });

      return res.status(204).send();
   } catch(error) {
      next(error);
   }
}

module.exports = {
   createContact,
   fetchContacts,
   importContacts,
   deleteContact,
   updateContact
}
