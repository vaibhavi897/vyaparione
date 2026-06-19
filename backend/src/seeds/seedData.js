require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Product = require("../models/Product");
const Sale = require("../models/Sale");

const productSeedData = [
  { name: "Milk", category: "Dairy", quantity: 50, threshold: 15, price: 30, supplier: "Amul" },
  { name: "Butter", category: "Dairy", quantity: 20, threshold: 10, price: 60, supplier: "Amul" },
  { name: "Rice", category: "Grains", quantity: 100, threshold: 25, price: 60, supplier: "India Foods" },
  { name: "Wheat", category: "Grains", quantity: 80, threshold: 20, price: 55, supplier: "India Foods" },
  { name: "Apple", category: "Fruits", quantity: 35, threshold: 10, price: 120, supplier: "Fresh Farm" },
  { name: "Banana", category: "Fruits", quantity: 60, threshold: 15, price: 40, supplier: "Fresh Farm" },
  { name: "Potato", category: "Vegetables", quantity: 90, threshold: 25, price: 30, supplier: "Green Basket" },
  { name: "Tomato", category: "Vegetables", quantity: 25, threshold: 20, price: 35, supplier: "Green Basket" },
  { name: "Chocolate", category: "Snacks", quantity: 40, threshold: 10, price: 20, supplier: "Nestle" },
  { name: "Bread", category: "Bakery", quantity: 45, threshold: 12, price: 45, supplier: "Britannia" },
];

const userSeedData = [
  {
    name: "Admin User",
    email: "admin@vyaparione.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Staff User",
    email: "staff@vyaparione.com",
    password: "staff123",
    role: "staff",
  },
];

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart-retail";
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("Connected to MongoDB");

    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Sale.deleteMany({}),
    ]);

    const hashedUsers = await Promise.all(
      userSeedData.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    const createdUsers = await User.insertMany(hashedUsers);
    const adminUser = createdUsers.find((user) => user.role === "admin");

    const insertedProducts = await Product.insertMany(productSeedData);

    const now = new Date();
    const salesData = [];

    // Seed 100 sales spread over the last 180 days (6 months)
    for (let i = 0; i < 100; i += 1) {
      const product = insertedProducts[Math.floor(Math.random() * insertedProducts.length)];
      const quantitySold = Math.floor(Math.random() * 5) + 1;
      const daysAgo = Math.floor(Math.random() * 180);
      const createdAt = new Date(now);
      createdAt.setDate(now.getDate() - daysAgo);
      createdAt.setHours(
        Math.floor(Math.random() * 18) + 6,
        Math.floor(Math.random() * 60),
        0,
        0
      );

      salesData.push({
        productId: product._id,
        quantitySold,
        totalAmount: quantitySold * product.price,
        soldBy: adminUser?._id,
        createdAt,
      });
    }

    await Sale.insertMany(salesData);

    console.log(`Seeded ${createdUsers.length} users`);
    console.log(`Seeded ${insertedProducts.length} products`);
    console.log(`Seeded ${salesData.length} sales`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
