const { body } = require("express-validator");

const contactValidator = [
   body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address"),
];

const contactUpdateValidator = [
      body("email")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Email cannot be empty"),
      
      body("firstName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("First name cannot be empty"),
      
      body("lastName")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Last name cannot be empty"),
]

module.exports = { contactValidator, contactUpdateValidator }