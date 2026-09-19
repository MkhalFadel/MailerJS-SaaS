const { body } = require("express-validator");

const templatesValidator = [
   body("name")
      .trim()
      .notEmpty()
      .withMessage("Template name is required"),

   body("content")
      .trim()
      .notEmpty()
      .withMessage("Content is required"),

   body("subject")
      .not()
      .exists()
      .withMessage("Template subjects are no longer supported")
];

const templatesUpdateValidator = [
   body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Template name cannot be empty"),

   body("content")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Content cannot be empty"),

   body("subject")
      .not()
      .exists()
      .withMessage("Template subjects are no longer supported")
];

module.exports = { templatesValidator, templatesUpdateValidator }
