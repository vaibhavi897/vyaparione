require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoURI =
        process.env.MONGO_URI ||
        process.env.MONGODB_URI ||
        "mongodb://127.0.0.1:27017/smart-retail";

    try {
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log("MongoDB Connected");
    } catch (error) {
        console.error("Database Connection Failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;