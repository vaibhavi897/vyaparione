const express = require("express");
const cors = require("cors");
const connectDB = require("./database/db");
const authRoutes =require("./routes/authRoutes");
const productRoutes =require("./routes/productRoutes");
const saleRoutes =require("./routes/saleRoutes");
const dashboardRoutes =require("./routes/dashboardRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
    res.send("Smart Retail Backend Running");
});

const PORT = 5000;

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});