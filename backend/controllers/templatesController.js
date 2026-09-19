const prisma = require("../lib/prisma");
const { updateTemplatesFields } = require("../utils/templates") 

async function fetchTemplates(req, res, next)
{
   try {
      const { id } = req.user;

      const templates = await prisma.templates.findMany({
         where: {
            user_id: id
         }
      })

      return res.status(200).json({
         message: "Templates fetched!",
         data: templates
      });
   } catch (error) {
      next(error);
   }
}

async function createTemplate(req, res, next)
{
   try {
      const { id } = req.user;
      const data = req.body;

      const template = await prisma.templates.create({
         data:{
            user_id: id,
            name: data.name,
            content: data.content
         }
      })

      return res.status(201).json({
         message: "Template Created",
         data: template
      });
   } catch (error) {
      next(error)
   }
}

async function updateTemplate(req, res, next)
{
   try {
      const { id } = req.params;
      const data = req.body;
      const fields = updateTemplatesFields(data);
   
      if(Object.keys(fields).length === 0)
         return res.status(400).json({
            message: "No fields to update"
         })
   
      const template = await prisma.templates.findFirst({
         where: {
            id: id,
            user_id: req.user.id
         }
      });
   
      if(!template)
         return res.status(404).json({
            error: "Template not found"
         });
      
      const updatedTemplate = await prisma.templates.update({
         where: {
            id: template.id
         },
         data: fields
      });

      return res.status(200).json({
         message: "Template updated successfully",
         data: updatedTemplate
      });
      
   } catch (error) {
      next(error);
   }
}

async function deleteTemplate(req, res, next)
{
   try {
      const { id } = req.params;
      const userId = req.user.id;
      const confirmed = req.query.confirm === "true";

      const template = await prisma.templates.findFirst({
         where: {
            id,
            user_id: userId
         }
      });

      if(!template)
      {
         return res.status(404).json({
            error: "Template not found"
         });
      }

      const [campaignCount, activeSendCount] = await Promise.all([
         prisma.campaigns.count({
            where: {
               user_id: userId,
               template_id: template.id
            }
         }),
         prisma.campaign_sends.count({
            where: {
               status: {
                  in: ["QUEUED", "PROCESSING"]
               },
               campaign: {
                  user_id: userId,
                  template_id: template.id
               }
            }
         })
      ]);

      if(activeSendCount > 0)
      {
         return res.status(409).json({
            error: "This template is currently being used by an active campaign send. Try again after the send finishes."
         });
      }

      if(campaignCount > 0 && !confirmed)
      {
         return res.status(409).json({
            error: "This template is used by one or more campaigns. Confirm deletion to remove it from those campaigns.",
            requiresConfirmation: true,
            campaignCount
         });
      }

      await prisma.templates.delete({
         where: {
            id: template.id
         }
      });

      return res.status(204).send();
   } catch (error) {
      next(error)
   }
}

module.exports = { fetchTemplates, createTemplate, updateTemplate, deleteTemplate }
