const { body } = require("express-validator");

const campaignRecipientValidator = [
   body("contactIds")
      .isArray({ min: 1 })
      .withMessage("contactIds must be a non-empty array"),

   body("contactIds.*")
      .isUUID()
      .withMessage("Each contact ID must be a valid UUID")
];

module.exports = { campaignRecipientValidator };