const { verifyToken } = require("../utils/auth")

function authMiddleware(req, res, next)
{
   try {
      // Fetch the access token stored in device's cookies
      const accessToken = req.cookies.authToken;

      // Check if the token is authorized
      if (!accessToken) {
         return res.status(401).json({
            message: "Unauthorized token",
         });
      }
      
      // Verify the token, if valid it will return the payload
      const payload = verifyToken(accessToken);
      req.user = payload;
      next();
   } catch (err) {
      res.status(401).json({
         message: "Invalid token"
      });
   }
}

module.exports = authMiddleware;