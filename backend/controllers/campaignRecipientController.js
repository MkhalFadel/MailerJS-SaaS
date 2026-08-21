const prisma = require("../lib/prisma");

async function addCampaignRecipients(req, res, next)
{
   try {
      const { campaignId } = req.params;
      const userId = req.user.id;
      const contactIds = [...new Set(req.body.contactIds)];

      const campaign = await prisma.campaigns.findFirst({
         where: {
            id: campaignId,
            user_id: userId
         }
      });

      if(!campaign)
         return res.status(404).json({
            error: "Campaign not found"
         });

      const contacts = await prisma.contacts.findMany({
         where: {
            id: {
               in: contactIds
            },
            user_id: userId
         },
         select: {
            id: true
         }
      });

      if(contacts.length !== contactIds.length)
         return res.status(404).json({
            error: "One or more contacts were not found"
         });

      const recipients = await prisma.campaign_recipients.createMany({
         data: contactIds.map((contactId) => ({
            campaign_id: campaignId,
            contact_id: contactId
         })),
         skipDuplicates: true
      });

      return res.status(201).json({
         message: "Campaign recipients added successfully",
         data: {
            added: recipients.count
         }
      });
   } catch(error) {
      next(error);
   }
}

async function fetchCampaignRecipients(req, res, next)
{
   try {
      const { campaignId } = req.params;
      const userId = req.user.id;

      const campaign = await prisma.campaigns.findFirst({
         where: {
            id: campaignId,
            user_id: userId
         }
      });

      if(!campaign)
         return res.status(404).json({
            error: "Campaign not found"
         });

      const recipients = await prisma.campaign_recipients.findMany({
         where: {
            campaign_id: campaignId
         },
         include: {
            contact: true
         },
         orderBy: {
            created_at: "asc"
         }
      });

      return res.status(200).json({
         message: "Campaign recipients fetched!",
         data: recipients
      });
   } catch(error) {
      next(error);
   }
}

async function deleteCampaignRecipient(req, res, next)
{
   try {
      const { campaignId, contactId } = req.params;
      const userId = req.user.id;

      const campaign = await prisma.campaigns.findFirst({
         where: {
            id: campaignId,
            user_id: userId
         }
      });

      if(!campaign)
         return res.status(404).json({
            error: "Campaign not found"
         });

      const contact = await prisma.contacts.findFirst({
         where: {
            id: contactId,
            user_id: userId
         }
      });

      if(!contact)
         return res.status(404).json({
            error: "Contact not found"
         });

      const result = await prisma.campaign_recipients.deleteMany({
         where: {
            campaign_id: campaignId,
            contact_id: contactId
         }
      });

      if(result.count === 0)
         return res.status(404).json({
            error: "Contact is not a recipient of this campaign"
         });

      return res.status(204).send();
   } catch(error) {
      next(error);
   }
}

module.exports = { addCampaignRecipients, fetchCampaignRecipients, deleteCampaignRecipient };