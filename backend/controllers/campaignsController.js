const prisma = require("../lib/prisma");
const { updateCampaignFields } = require("../utils/campaigns");
const { createTransporter, sendEmail } = require("../services/smtpService");

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
            smtp_account: true
         },
         orderBy: {
            created_at: "desc"
         }
      });

      const safeCampaigns = campaigns.map((campaign) => {
         const { password_encrypted, ...smtpAccount } = campaign.smtp_account;

         return {...campaign, smtp_account: smtpAccount};
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

      const campaign = await prisma.campaigns.findFirst({
         where: {
            id,
            user_id: userId
         },
         include: {
            template: true,
            smtp_account: true,
            recipients: {
               include: {
                  contact: true
               }
            }
         }
      });

      if(!campaign)
         return res.status(404).json({
            error: "Campaign not found"
         });

      if(campaign.recipients.length === 0)
         return res.status(400).json({
            error: "Campaign has no recipients"
         });

      const transporter = createTransporter(campaign.smtp_account);

      const results = {
         total: campaign.recipients.length,
         successful: 0,
         failed: 0,
         failures: []
      };

      for(const recipient of campaign.recipients)
      {
         try {
            await sendEmail(transporter,{
               senderName: campaign.smtp_account.sender_name,
               senderEmail: campaign.smtp_account.sender_email,
               recipient: recipient.contact.email,
               subject: campaign.subject,
               html: campaign.template.content
            });

            results.successful++;
         } catch(error) {
            results.failed++;

            results.failures.push({
               contactId: recipient.contact_id,
               email: recipient.contact.email,
               error: error.message
            });
         }
      }

      return res.status(200).json({
         message: "Campaign sending completed",
         data: results
      });
   } catch(error) {
      next(error);
   }
}

module.exports = { fetchCampaigns, fetchCampaign, createCampaign, updateCampaign, deleteCampaign, sendCampaign };