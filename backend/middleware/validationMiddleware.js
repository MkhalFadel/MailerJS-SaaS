const { validationResult } = require("express-validator");

function validate(req, res, next)
{
   const errors = validationResult(req);

   if(!errors.isEmpty())
      return res.status(400).json({
         message: "Validation failed",
         fields: errors.array()
      });

   next();
}

module.exports = validate;