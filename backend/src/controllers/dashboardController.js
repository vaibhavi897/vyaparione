const Product = require("../models/Product");
const Sale = require("../models/Sale");

const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();

    const lowStockProducts = await Product.find({
      $expr: {
        $lte: ["$quantity", "$threshold"],
      },
    }).sort({ quantity: 1 });

    const products = await Product.find();
    const inventoryValue = products.reduce(
      (sum, product) => sum + product.quantity * product.price,
      0
    );

    const sales = await Sale.find();
    const totalSales = sales.reduce(
      (sum, sale) => sum + (sale.totalAmount || 0),
      0
    );

    const recentSales = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("productId");

    res.json({
      totalProducts,
      lowStockCount: lowStockProducts.length,
      lowStockList: lowStockProducts,
      inventoryValue,
      totalSales,
      recentSales,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const topSellingProducts = await Sale.aggregate([
      {
        $group: {
          _id: "$productId",
          unitsSold: { $sum: "$quantitySold" },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 1,
          unitsSold: 1,
          name: "$product.name",
        },
      },
    ]);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Sale.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const formattedMonthlyRevenue = monthlyRevenue.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue || 0,
    }));

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    let previousMonth = currentMonth - 1;
    let previousMonthYear = currentYear;

    if (previousMonth === 0) {
      previousMonth = 12;
      previousMonthYear = currentYear - 1;
    }

    const currentMonthData = monthlyRevenue.find(
      (m) => m._id.month === currentMonth && m._id.year === currentYear
    ) || { revenue: 0 };
    const previousMonthData = monthlyRevenue.find(
      (m) => m._id.month === previousMonth && m._id.year === previousMonthYear
    ) || { revenue: 0 };

    const currentMonthRevenue = currentMonthData.revenue || 0;
    const previousMonthRevenue = previousMonthData.revenue || 0;

    let revenueGrowth = 0;
    if (previousMonthRevenue > 0) {
      revenueGrowth = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    } else if (currentMonthRevenue > 0) {
      revenueGrowth = 100;
    }

    const categoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: "$count",
        },
      },
    ]);

    res.json({
      topSellingProducts,
      monthlyRevenueTrend: formattedMonthlyRevenue,
      currentMonthRevenue,
      revenueGrowth: Number(revenueGrowth.toFixed(2)),
      categoryDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
};