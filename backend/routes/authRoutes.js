const express = require("express");
const router = express.Router();
const {
   login,
   registerUsers,
   updateUser,
   updatePassword,
   verifyGoogleReauthentication,
   deleteUser,
   fetchUser,
   updateAccessToken,
   googleLogin,
   logout
} = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")
const validate = require("../middleware/validationMiddleware");
const { registerValidator, loginValidator } = require("../validators/authValidator");
const {
   googleAuthLimiter,
   googleReauthenticationLimiter,
   loginLimiter,
   refreshLimiter,
   registrationLimiter,
   sensitiveAccountLimiter
} = require("../middleware/rateLimiters");

// fetch user
router.get("/", authMiddleware, fetchUser)

// Create new user
router.post('/register', registrationLimiter, registerValidator, validate, registerUsers)

// Login
router.post('/login', loginLimiter, loginValidator, validate, login)

// Update user info
router.put("/update", authMiddleware, updateUser)

// Set or change the authenticated user's password
router.patch("/password", authMiddleware, sensitiveAccountLimiter, updatePassword)

// Delete user
router.delete("/delete", authMiddleware, sensitiveAccountLimiter, deleteUser)

// Refresh user's auth token
router.post("/refresh", refreshLimiter, updateAccessToken);

// Sign in with a verified Google identity
router.post("/google", googleAuthLimiter, googleLogin);

// Verify a Google identity before Google-only users set their first password
router.post(
   "/google/reauthenticate",
   authMiddleware,
   googleReauthenticationLimiter,
   verifyGoogleReauthentication
);

// Logout
router.post("/logout", logout)

module.exports = router;
