const mongoose = require("mongoose");

const saleSchema =
new mongoose.Schema(
{
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    quantitySold: {
        type: Number,
        required: true
    },

    totalAmount: {
        type: Number,
        required: true
    },

    soldBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},
{
    timestamps: true
}
);

module.exports =
mongoose.model("Sale", saleSchema);