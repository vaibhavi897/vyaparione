const express = require("express");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const { getForecastData } = require("../controllers/forecastController");

const router = express.Router();

router.get("/", protect, adminOnly, getForecastData);

module.exports = router;
