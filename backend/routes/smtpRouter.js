const express = require("express");
const router = express.Router();
const { fetchSmtpAccounts, createSmtpAccount, updateSmtpAccount, deleteSmtpAccount, verifyConnection } = require("../controllers/smtpController");
const { smtpValidator, smtpUpdateValidator } = require("../validators/smtpValidator");
const validate = require("../middleware/validationMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

// Fetch user's SMTP accounts
router.get("/", authMiddleware, fetchSmtpAccounts);

// Create SMTP account
router.post("/", authMiddleware, smtpValidator, validate, createSmtpAccount);

// Update SMTP account
router.put("/:id", authMiddleware, smtpUpdateValidator, validate, updateSmtpAccount);

// Delete SMTP account
router.delete("/:id", authMiddleware, deleteSmtpAccount);

// Test SMTP connection
router.post("/:id/test", authMiddleware, verifyConnection)

module.exports = router;
