const { body } = require("express-validator");

const contactValidator = [
   body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address"),
];

module.exports = { contactValidator }