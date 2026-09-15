const { verifyToken } = require("../utils/auth")

function authMiddleware(req, res, next)
{
   try {
      // Fetch the access token stored in device's cookies
      const accessToken = req.cookies.authToken;

      // Check if the token is authorized
      if (!accessToken) {
         return res.status(401).json({
            error: "Access token is required",
            code: "ACCESS_TOKEN_MISSING"
         });
      }
      
      // Verify the token, if valid it will return the payload
      const payload = verifyToken(accessToken);
      req.user = payload;
      next();
   } catch (err) {
      res.status(401).json({
         error: err.name === "TokenExpiredError"
            ? "Access token has expired"
            : "Access token is invalid",
         code: err.name === "TokenExpiredError"
            ? "ACCESS_TOKEN_EXPIRED"
            : "ACCESS_TOKEN_INVALID"
      });
   }
}

module.exports = authMiddleware;
