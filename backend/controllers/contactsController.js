const prisma = require("../lib/prisma");
const { updateContactsFields } = require("../utils/contacts");

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

module.exports = { createContact, fetchContacts, deleteContact, updateContact }
