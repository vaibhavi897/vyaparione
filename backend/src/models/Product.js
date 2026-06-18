const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    threshold: {
        type: Number,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    supplier: {
        type: String
    }
},
{
    timestamps: true
}
);

module.exports =
mongoose.model("Product", productSchema);