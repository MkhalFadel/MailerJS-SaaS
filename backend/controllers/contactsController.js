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
            id: data.id,
            user_id: req.user.id
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
      })

      return res.status(200).json({
         message: "Contact updated successfully",
         data: contact
      })

   } catch (error) {
      next(error)
   }
}

async function deleteContact(req, res, next)
{
   try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await prisma.contacts.deleteMany({
         where: {
            id: id,
            user_id: userId
         }
      });

      if(result.count === 0)
      {
         return res.status(404).json({
            error: "Contact not found"
         });
      }

      return res.status(204).send();
   } catch(error) {
      next(error);
   }
}

module.exports = { createContact, fetchContacts, deleteContact, updateContact }