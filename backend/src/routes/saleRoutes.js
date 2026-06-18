const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const express = require("express");
const router = express.Router();

const {
    recordSale,
    getSales
} = require("../controllers/saleController");

router.post(
    "/",
    protect,
    adminOnly,
    recordSale
);

router.get(
    "/",
    protect,
    getSales
);

module.exports =
router;