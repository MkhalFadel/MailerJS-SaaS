const express = require("express");
const router = express.Router();
const { login, registerUsers, updateUser, deleteUser, fetchUser, updateAccessToken, logout } = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")
const validate = require("../middleware/validationMiddleware");
const { registerValidator, loginValidator } = require("../validators/authValidator");

// fetch user
router.get("/", authMiddleware, fetchUser)

// Create new user
router.post('/register', registerValidator, validate, registerUsers)

// Login
router.post('/login', loginValidator, validate, login)

// Update user info
router.put("/update", authMiddleware, updateUser)

// Delete user
router.delete("/delete", authMiddleware, deleteUser)

// Refresh user's auth token
router.post("/refresh", updateAccessToken);

// Logout
router.post("/logout", logout)

module.exports = router;