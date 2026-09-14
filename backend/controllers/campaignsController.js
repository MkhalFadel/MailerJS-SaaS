const prisma = require("../lib/prisma");
const { updateCampaignFields } = require("../utils/campaigns");
const {
   CampaignSendError,
   createCampaignSend,
   getCampaignSend,
   getCampaignSends,
   serializeCampaignSend
} = require("../services/campaignSendService");

async function fetchCampaigns(req, res, next)
{
   try {
      const userId = req.user.id;

      const campaigns = await prisma.campaigns.findMany({
         where: {
            user_id: userId
         },
         include: {
            template: true,
            smtp_account: true,
            recipients: {
               include: {
                  deliveries: {
                     select: {
                        status: true
                     }
                  }
               }
            }
         },
         orderBy: {
            created_at: "desc"
         }
      });

      const safeCampaigns = campaigns.map((campaign) => {
         const { password_encrypted, ...smtpAccount } = campaign.smtp_account;

         const sent = campaign.recipients.reduce(
            (total,recipient) => {
               return total + recipient.deliveries.filter(
                  delivery => delivery.status === "accepted"
               ).length;
            }, 0);

         return {
            ...campaign,
            smtp_account: smtpAccount,
            recipients: campaign.recipients.length,
            sent
         };
      });

      return res.status(200).json({
         message: "Campaigns fetched!",
         data: safeCampaigns
      });
   } catch(error) {
      next(error);
   }
}

async function fetchCampaign(req, res, next)
{
   try {
      const { id } = req.params;
      const userId = req.user.id;

      const campaign = await prisma.campaigns.findFirst({
         where: {
            id,
            user_id: userId
         },
         include: {
            template: true,
            smtp_account: true
         }
      });

      if(!campaign)
         return res.status(404).json({
            error: "Campaign not found"
         });

      const { password_encrypted, ...smtpAccount } = campaign.smtp_account;

      return res.status(200).json({
         message: "Campaign fetched!",
         data: {
            ...campaign,
            smtp_account: smtpAccount
         }
      });
   } catch(error) {
      next(error);
   }
}

async function createCampaign(req, res, next)
{
   try {
      const userId = req.user.id;
      const data = req.body;

      const template = await prisma.templates.findFirst({
         where: {
            id: data.templateId,
            user_id: userId
         }
      });

      if(!template)
         return res.status(404).json({
            error: "Template not found"
         });

      const smtpAccount = await prisma.smtp_accounts.findFirst({
         where: {
            id: data.smtpAccountId,
            user_id: userId
         }
      });

      if(!smtpAccount)
         return res.status(404).json({
            error: "SMTP account not found"
         });

      const campaign = await prisma.campaigns.create({
         data: {
            user_id: userId,
            name: data.name.trim(),
            subject: data.subject.trim(),
            template_id: data.templateId,
            smtp_account_id: data.smtpAccountId
         },
         include: {
            template: true,
            smtp_account: true
         }
      });

      const { password_encrypted, ...safeSmtpAccount } = campaign.smtp_account;

      return res.status(201).json({
         message: "Campaign created successfully",
         data: {
            ...campaign,
            smtp_account: safeSmtpAccount
         }
      });
   } catch(error) {
      next(error);
   }
}

async function updateCampaign(req, res, next)
{
   try {
      const { id } = req.params;
      const userId = req.user.id;
      const data = req.body;

      const fields = updateCampaignFields(data);

      if(Object.keys(fields).length === 0)
         return res.status(400).json({
            error: "No fields to update"
         });

      const campaign = await prisma.campaigns.findFirst({
         where: {
            id,
            user_id: userId
         }
      });

      if(!campaign)
         return res.status(404).json({
            error: "Campaign not found"
         });

      if(fields.template_id)
      {
         const template = await prisma.templates.findFirst({
            where: {
               id: fields.template_id,
               user_id: userId
            }
         });

         if(!template)
            return res.status(404).json({
               error: "Template not found"
            });
      }

      if(fields.smtp_account_id)
      {
         const smtpAccount = await prisma.smtp_accounts.findFirst({
            where: {
               id: fields.smtp_account_id,
               user_id: userId
            }
         });

         if(!smtpAccount)
            return res.status(404).json({
               error: "SMTP account not found"
            });
      }

      const updatedCampaign = await prisma.campaigns.update({
         where: {
            id: campaign.id
         },
         data: fields,
         include: {
            template: true,
            smtp_account: true
         }
      });

      const { password_encrypted, ...safeSmtpAccount } = updatedCampaign.smtp_account;

      return res.status(200).json({
         message: "Campaign updated successfully",
         data: {
            ...updatedCampaign,
            smtp_account: safeSmtpAccount
         }
      });
   } catch(error) {
      next(error);
   }
}

async function deleteCampaign(req, res, next)
{
   try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await prisma.campaigns.deleteMany({
         where: {
            id,
            user_id: userId
         }
      });

      if(result.count === 0)
         return res.status(404).json({
            error: "Campaign not found"
         });

      return res.status(204).send();
   } catch(error) {
      next(error);
   }
}

async function sendCampaign(req, res, next)
{
   try {
      const { id } = req.params;
      const userId = req.user.id;

      const campaignSend = await createCampaignSend(id, userId);

      return res.status(202).json({
         message: "Campaign send queued",
         data: serializeCampaignSend(campaignSend)
      });
   } catch(error) {
      if(error instanceof CampaignSendError)
      {
         return res.status(error.status).json({
            error: error.message
         });
      }

      next(error);
   }
}

async function fetchCampaignSends(req, res, next)
{
   try {
      const { id } = req.params;
      const campaignSends = await getCampaignSends(id, req.user.id);

      return res.status(200).json({
         message: "Campaign sends fetched!",
         data: campaignSends.map(serializeCampaignSend)
      });
   } catch(error) {
      if(error instanceof CampaignSendError)
      {
         return res.status(error.status).json({
            error: error.message
         });
      }

      next(error);
   }
}

async function fetchCampaignSend(req, res, next)
{
   try {
      const { id, sendId } = req.params;
      const campaignSend = await getCampaignSend(
         id,
         sendId,
         req.user.id
      );

      return res.status(200).json({
         message: "Campaign send fetched!",
         data: serializeCampaignSend(campaignSend)
      });
   } catch(error) {
      if(error instanceof CampaignSendError)
      {
         return res.status(error.status).json({
            error: error.message
         });
      }

      next(error);
   }
}

async function fetchCampaignDeliveries(req, res, next)
{
   try {
      const { id } = req.params;
      const userId = req.user.id;

      const campaign = await prisma.campaigns.findFirst({
         where: {
            id: id,
            user_id: userId
         }
      });

      if(!campaign)
         return res.status(404).json({
            error: "Campaign not found",
         });

      const deliveries = await prisma.campaign_deliveries.findMany({
         where: {
            OR: [
               {
                  campaign_recipient: {
                     campaign_id: id
                  }
               },
               {
                  campaign_send: {
                     campaign_id: id
                  }
               }
            ]
         },
         include: {
            campaign_recipient: {
               include: {
                  contact: true
               }
            },
            campaign_send: {
               select: {
                  created_at: true
               }
            }
         },
         orderBy: {
            created_at: "desc"
         }
      });

      const data = deliveries.map((delivery) => {
         const contact = delivery.recipient_email
            ? {
               email: delivery.recipient_email,
               first_name: delivery.recipient_first_name,
               last_name: delivery.recipient_last_name
            }
            : delivery.campaign_recipient?.contact;

         return {
            id: delivery.id,
            campaign_send_id: delivery.campaign_send_id,
            campaign_send_created_at: delivery.campaign_send?.created_at,
            status: delivery.status,
            error_message: delivery.error_message,
            sent_at: delivery.sent_at,
            created_at: delivery.created_at,
            contact
         };
      });

      return res.status(200).json({
         message: "Campaign deliveries fetched!",
         data: data
      });
   } catch(error) {
      next(error);
   }
}

module.exports = {
   fetchCampaigns,
   fetchCampaign,
   createCampaign,
   updateCampaign,
   deleteCampaign,
   sendCampaign,
   fetchCampaignSends,
   fetchCampaignSend,
   fetchCampaignDeliveries
};
