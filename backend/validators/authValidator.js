const { body } = require("express-validator");

const registerValidator = [
   body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address"),

   body("firstName")
      .trim()
      .notEmpty()
      .withMessage("First name is required"),

   body("lastName")
      .trim()
      .notEmpty()
      .withMessage("Last name is required"),

   body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
];

const loginValidator = [
   body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address"),

   body("password")
      .notEmpty()
      .withMessage("Password is required")
];

module.exports = { registerValidator, loginValidator };