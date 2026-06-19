const Sale = require("../models/Sale");
const Product = require("../models/Product");

const recordSale = async (req, res) => {
  try {
    const { productId, quantitySold } = req.body;

    if (!productId || !quantitySold) {
      return res.status(400).json({ message: "Product and quantity are required" });
    }

    const parsedQuantity = Number(quantitySold);

    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: "Quantity must be a positive number" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    if (product.quantity < parsedQuantity) {
      return res.status(400).json({ message: "Insufficient Stock" });
    }

    const totalAmount = parsedQuantity * product.price;

    const sale = await Sale.create({
      productId,
      quantitySold: parsedQuantity,
      totalAmount,
      soldBy: req.user?.id,
    });

    product.quantity -= parsedQuantity;
    await product.save();

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .sort({ createdAt: -1 })
      .populate("productId")
      .populate("soldBy", "name role");

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  recordSale,
  getSales,
};