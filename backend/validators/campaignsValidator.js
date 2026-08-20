const { body } = require("express-validator");

const campaignValidator = [
   body("name")
      .trim()
      .notEmpty()
      .withMessage("Campaign name is required"),

   body("subject")
      .trim()
      .notEmpty()
      .withMessage("Subject is required"),

   body("templateId")
      .trim()
      .notEmpty()
      .withMessage("Template ID is required"),

   body("smtpAccountId")
      .trim()
      .notEmpty()
      .withMessage("SMTP account ID is required")
];

const campaignUpdateValidator = [
   body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Campaign name cannot be empty"),

   body("subject")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Subject cannot be empty"),

   body("templateId")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Template ID cannot be empty"),

   body("smtpAccountId")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("SMTP account ID cannot be empty")
];

module.exports = { campaignValidator, campaignUpdateValidator };