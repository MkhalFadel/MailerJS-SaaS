const { body } = require("express-validator");

const templatesValidator = [
   body("name")
      .trim()
      .notEmpty()
      .withMessage("Template name is required"),

   body("subject")
      .trim()
      .notEmpty()
      .withMessage("Subject is required"),

   body("content")
      .trim()
      .notEmpty()
      .withMessage("Content is required")
];

const templatesUpdateValidator = [
   body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Template name cannot be empty"),

   body("subject")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Subject cannot be empty"),

   body("content")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Content cannot be empty")
];

module.exports = { templatesValidator, templatesUpdateValidator }