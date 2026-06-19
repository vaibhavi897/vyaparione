const Product = require("../models/Product");
const Sale = require("../models/Sale");

const getMonthRanges = () => {
  const ranges = [];
  const now = new Date();
  for (let i = 0; i < 5; i++) {
    // i = 0 is current month, i = 4 is 4 months ago
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    ranges.push({ start, end, label: d.toLocaleString("default", { month: "short", year: "2-digit" }) });
  }
  return ranges.reverse(); // [oldest (4m ago), ..., latest (current m)]
};

const getForecastData = async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    const ranges = getMonthRanges();
    const weights = [0.10, 0.15, 0.20, 0.25, 0.30];

    const forecastReport = [];

    for (const product of products) {
      // Find all sales for this product
      const sales = await Sale.find({ productId: product._id });

      // Group sales into the 5 month ranges
      const monthlySales = [0, 0, 0, 0, 0];
      sales.forEach((sale) => {
        const saleDate = new Date(sale.createdAt);
        for (let i = 0; i < 5; i++) {
          if (saleDate >= ranges[i].start && saleDate <= ranges[i].end) {
            monthlySales[i] += sale.quantitySold;
            break;
          }
        }
      });

      // Calculate Weighted Moving Average (WMA)
      let predictedDemand = 0;
      for (let i = 0; i < 5; i++) {
        predictedDemand += monthlySales[i] * weights[i];
      }
      predictedDemand = Math.round(predictedDemand * 10) / 10; // Round to 1 decimal place

      const dailyDemand = predictedDemand / 30;
      let stockDepletionTime = null; // null means infinite/stable
      
      if (dailyDemand > 0) {
        stockDepletionTime = Math.round((product.quantity / dailyDemand) * 10) / 10;
      }

      // Risk Classification
      let riskLevel = "Low";
      if (product.quantity === 0) {
        riskLevel = "High";
      } else if (product.quantity <= product.threshold) {
        riskLevel = "High";
      } else if (stockDepletionTime !== null && stockDepletionTime <= 7) {
        riskLevel = "High";
      } else if (stockDepletionTime !== null && stockDepletionTime <= 21) {
        riskLevel = "Moderate";
      }

      // Recommended Reorder Quantity
      let recommendedReorder = 0;
      if (riskLevel === "High" || riskLevel === "Moderate") {
        const targetStock = Math.ceil(predictedDemand * 1.5);
        recommendedReorder = Math.max(0, targetStock - product.quantity);
        // If low stock but predicted demand is 0, recommend restocking up to twice the threshold
        if (recommendedReorder === 0 && product.quantity <= product.threshold) {
          recommendedReorder = Math.max(0, (product.threshold * 2) - product.quantity);
        }
      }

      forecastReport.push({
        productId: product._id,
        name: product.name,
        category: product.category,
        currentStock: product.quantity,
        threshold: product.threshold,
        price: product.price,
        supplier: product.supplier || "N/A",
        monthlySalesHistory: monthlySales,
        predictedDemand,
        stockDepletionTime, // in days, or null
        riskLevel,
        recommendedReorder,
      });
    }

    res.json({
      monthLabels: ranges.map((r) => r.label),
      forecasts: forecastReport,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getForecastData,
};
