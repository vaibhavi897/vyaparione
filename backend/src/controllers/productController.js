const Product = require("../models/Product");

const validateProductPayload = (payload) => {
  const { name, category, quantity, threshold, price, supplier } = payload;

  if (!name || !category || !supplier) {
    return "All text fields are required";
  }

  if (Number.isNaN(Number(quantity)) || Number(quantity) < 0) {
    return "Quantity must be a non-negative number";
  }

  if (Number.isNaN(Number(threshold)) || Number(threshold) < 0) {
    return "Threshold must be a non-negative number";
  }

  if (Number.isNaN(Number(price)) || Number(price) <= 0) {
    return "Price must be a positive number";
  }

  return null;
};

const addProduct = async (req, res) => {
  try {
    const validationError = validateProductPayload(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const product = await Product.create({
      ...req.body,
      quantity: Number(req.body.quantity),
      threshold: Number(req.body.threshold),
      price: Number(req.body.price),
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const validationError = validateProductPayload(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        quantity: Number(req.body.quantity),
        threshold: Number(req.body.threshold),
        price: Number(req.body.price),
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};