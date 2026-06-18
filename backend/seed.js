require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./src/models/Product");
const Sale = require("./src/models/Sale");
const User = require("./src/models/User");

const productsData = [
  { name: "Milk", category: "Dairy", quantity: 50, threshold: 15, price: 30, supplier: "Amul" },
  { name: "Butter", category: "Dairy", quantity: 20, threshold: 10, price: 60, supplier: "Amul" },
  { name: "Rice", category: "Grains", quantity: 100, threshold: 25, price: 60, supplier: "India Foods" },
  { name: "Wheat", category: "Grains", quantity: 80, threshold: 20, price: 55, supplier: "India Foods" },
  { name: "Apple", category: "Fruits", quantity: 35, threshold: 10, price: 120, supplier: "Fresh Farm" },
  { name: "Banana", category: "Fruits", quantity: 60, threshold: 15, price: 40, supplier: "Fresh Farm" },
  { name: "Potato", category: "Vegetables", quantity: 90, threshold: 25, price: 30, supplier: "Green Basket" },
  { name: "Tomato", category: "Vegetables", quantity: 25, threshold: 20, price: 35, supplier: "Green Basket" },
  { name: "Chocolate", category: "Snacks", quantity: 40, threshold: 10, price: 20, supplier: "Nestle" },
  { name: "Bread", category: "Bakery", quantity: 45, threshold: 12, price: 45, supplier: "Britannia" }
];

const seedDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    console.log("Clearing existing Products and Sales...");
    await Product.deleteMany({});
    await Sale.deleteMany({});
    console.log("Cleared.");

    console.log("Inserting Products...");
    const insertedProducts = await Product.insertMany(productsData);
    console.log(`Inserted ${insertedProducts.length} products.`);

    console.log("Generating realistic Sales data...");
    const salesData = [];
    const now = new Date();

    for (let i = 0; i < 40; i++) {
      // Pick random product
      const product = insertedProducts[Math.floor(Math.random() * insertedProducts.length)];
      
      // Random quantity between 1 and 5
      const qty = Math.floor(Math.random() * 5) + 1;
      
      // Generate random date within the last 6 months
      const dateOffset = Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000;
      const createdAt = new Date(now.getTime() - dateOffset);

      salesData.push({
        productId: product._id,
        quantitySold: qty,
        totalAmount: qty * product.price,
        createdAt
      });
    }

    // Sort by date so older is inserted with older timestamps (though insertMany doesn't strictly guarantee order, it's fine)
    await Sale.insertMany(salesData);
    console.log(`Inserted ${salesData.length} sales.`);

    console.log("Seed complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDB();
