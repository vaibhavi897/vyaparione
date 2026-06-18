const express = require("express");

const protect =require("../middleware/authMiddleware");

const adminOnly =require("../middleware/adminMiddleware");

const router = express.Router();

const {
    addProduct,
    getProducts,
    updateProduct,
    deleteProduct
} =
require("../controllers/productController");



router.get(
    "/",
    protect,
    getProducts
);

router.post(
    "/",
    protect,
    adminOnly,
    addProduct
);

router.put(
    "/:id",
    protect,
    adminOnly,
    updateProduct
);

router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteProduct
);

module.exports = router;