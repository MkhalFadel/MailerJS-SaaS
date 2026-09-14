const express = require("express");
const router = express.Router();
const { fetchDashboard } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, fetchDashboard);

module.exports = router;
