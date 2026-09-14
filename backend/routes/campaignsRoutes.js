const express = require("express");
const router = express.Router();
const {
   fetchCampaigns,
   createCampaign,
   updateCampaign,
   deleteCampaign,
   fetchCampaign,
   sendCampaign,
   fetchCampaignSends,
   fetchCampaignSend,
   fetchCampaignDeliveries
} = require("../controllers/campaignsController");
const authMiddleware = require("../middleware/authMiddleware");
const { campaignValidator, campaignUpdateValidator } = require("../validators/campaignsValidator");
const validate = require("../middleware/validationMiddleware")

// Fetch all user's campaigns
router.get("/", authMiddleware, fetchCampaigns);

// Fetch campaign send history
router.get("/:id/sends", authMiddleware, fetchCampaignSends);

// Fetch a campaign send
router.get("/:id/sends/:sendId", authMiddleware, fetchCampaignSend);

// Fetch a single user's campaign
router.get("/:id", authMiddleware, fetchCampaign );

// Create campaigns
router.post("/", authMiddleware, campaignValidator, validate, createCampaign);

// Update campaigns
router.put("/:id", authMiddleware, campaignUpdateValidator, validate, updateCampaign);

// Delete campaigns
router.delete("/:id", authMiddleware, deleteCampaign);

// Send campaign
router.post("/:id/send", authMiddleware, sendCampaign);

// Fetch delivery history
router.get("/:id/deliveries", authMiddleware, fetchCampaignDeliveries);

module.exports = router;
