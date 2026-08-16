const express = require("express");
const router = express.Router();
const { login, registerUsers, updateUser, deleteUser } = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")

// Create new user
router.post('/register', registerUsers)

// Login
router.post('/login', login)

// Update user info
router.put("/update", authMiddleware, updateUser)

// Delete user
router.delete("/delete", authMiddleware, deleteUser)

module.exports = router;