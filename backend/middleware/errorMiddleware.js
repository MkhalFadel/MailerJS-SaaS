function errorHandler(err, req, res, next)
{
   console.error(err);

   if(err.code === "P2002")
      return res.status(409).json({
         error: "Email already exists"
      });

   return res.status(500).json({
      error: "Internal server error"
   });
}

module.exports = errorHandler;