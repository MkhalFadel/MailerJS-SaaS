const { body } = require("express-validator");

const smtpValidator = [
   body("provider")
      .trim()
      .notEmpty()
      .withMessage("Provider is required"),

   body("host")
      .trim()
      .notEmpty()
      .withMessage("Host is required"),

   body("port")
      .notEmpty()
      .withMessage("Port is required")
      .isInt({ min: 1, max: 65535 })
      .withMessage("Port must be a valid integer between 1 and 65535")
      .toInt(),

   body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required"),

   body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required"),

   body("senderEmail")
      .trim()
      .notEmpty()
      .withMessage("Sender email is required")
      .isEmail()
      .withMessage("Sender email must be valid"),

   body("senderName")
      .optional()
      .trim(),

   body("secure")
      .optional()
      .isBoolean()
      .withMessage("Secure must be true or false")
      .toBoolean(),

   body("isDefault")
      .optional()
      .isBoolean()
      .withMessage("isDefault must be true or false")
      .toBoolean()
];

const smtpUpdateValidator = [
   body("provider")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Provider cannot be empty"),

   body("host")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Host cannot be empty"),

   body("port")
      .optional()
      .isInt({ min: 1, max: 65535 })
      .withMessage("Port must be a valid integer between 1 and 65535")
      .toInt(),

   body("username")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Username cannot be empty"),

   body("password")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Password cannot be empty"),

   body("senderEmail")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Sender email must be valid"),

   body("senderName")
      .optional()
      .trim(),

   body("secure")
      .optional()
      .isBoolean()
      .withMessage("Secure must be true or false")
      .toBoolean(),

   body("isDefault")
      .optional()
      .isBoolean()
      .withMessage("isDefault must be true or false")
      .toBoolean()
];

module.exports = { smtpValidator, smtpUpdateValidator };
