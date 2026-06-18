const Sale =
require("../models/Sale");

const Product =
require("../models/Product");

const recordSale =
async (req, res) => {

    try {

        const {
            productId,
            quantitySold
        } = req.body;

        const product =
        await Product.findById(
            productId
        );

        if (!product) {

            return res.status(404)
            .json({
                message:
                "Product Not Found"
            });

        }

        if (
            product.quantity <
            quantitySold
        ) {

            return res.status(400)
            .json({
                message:
                "Insufficient Stock"
            });

        }

        const totalAmount =
            quantitySold *
            product.price;

        const sale =
        await Sale.create({

            productId,

            quantitySold,

            totalAmount

        });

        product.quantity -=
        quantitySold;

        await product.save();

        res.status(201)
        .json(sale);

    } catch (error) {

        res.status(500)
        .json({
            message:
            error.message
        });

    }

};

const getSales =
async (req, res) => {

    try {

        const sales =
        await Sale.find()
        .populate("productId");

        res.json(sales);

    } catch (error) {

        res.status(500)
        .json({
            message:
            error.message
        });

    }

};

module.exports = {
    recordSale,
    getSales
};