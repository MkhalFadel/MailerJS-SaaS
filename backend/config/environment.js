const REQUIRED_PRODUCTION_VARIABLES = [
   "DATABASE_URL",
   "QUEUE_REDIS_URL",
   "JWT_SECRET",
   "REFRESH_SECRET",
   "FRONTEND_URL",
   "AUTH_COOKIE_SAME_SITE",
   "SMTP_ENCRYPTION_KEY"
];

function getFrontendOrigin()
{
   const frontendUrl = process.env.FRONTEND_URL;

   if(!frontendUrl)
      throw new Error("FRONTEND_URL is required to configure CORS");

   try {
      const origin = new URL(frontendUrl).origin;

      if(origin === "null")
         throw new Error("URL has no origin");

      return origin;
   } catch {
      throw new Error("FRONTEND_URL must be a valid absolute URL");
   }
}

function validateProductionEnvironment()
{
   if(process.env.NODE_ENV !== "production")
      return;

   const missingVariables = REQUIRED_PRODUCTION_VARIABLES.filter(
      name => !process.env[name]
   );

   if(missingVariables.length > 0)
   {
      throw new Error(
         `Missing required production environment variables: ${missingVariables.join(", ")}`
      );
   }

   if(process.env.AUTH_COOKIE_SAME_SITE.toLowerCase() !== "none")
   {
      throw new Error(
         "AUTH_COOKIE_SAME_SITE must be none when NODE_ENV is production"
      );
   }
}

module.exports = {
   getFrontendOrigin,
   validateProductionEnvironment
};
