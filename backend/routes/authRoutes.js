const express = require("express");
const router = express.Router();
const { login, registerUsers, updateUser, deleteUser } = require("../controllers/authController")

// Create new user
router.post('/register', registerUsers)

// Login
router.post('/login', login)

// Update user info
router.put("/update", updateUser)

// Delete user
router.delete("/delete", deleteUser)

module.exports = router;