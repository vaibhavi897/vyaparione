const express = require("express");

const router = express.Router();

const {
   getDashboardStats,
   getAnalytics
} = require("../controllers/dashboardController");

const protect = require("../middleware/authMiddleware");

router.get("/stats", protect, getDashboardStats);
router.get("/analytics", protect, getAnalytics);

module.exports = router;