const express = require("express");
const router = express.Router();
const { addCampaignRecipients, fetchCampaignRecipients, deleteCampaignRecipient } = require("../controllers/campaignRecipientController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware");
const { campaignRecipientValidator } = require("../validators/campaignRecipientValidator");

router.post("/:campaignId/recipients", authMiddleware, campaignRecipientValidator, validate, addCampaignRecipients);

router.get("/:campaignId/recipients", authMiddleware, fetchCampaignRecipients);

router.delete("/:campaignId/recipients/:contactId", authMiddleware, deleteCampaignRecipient);

module.exports = router;