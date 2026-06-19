import { useState, useEffect, useMemo } from "react";
import MainLayout from "../layouts/MainLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import ForecastCard from "../components/ForecastCard";
import RiskBadge from "../components/RiskBadge";
import { getForecastData } from "../services/forecastService";

function DemandIntelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRisk, setSelectedRisk] = useState("All");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getForecastData();
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load forecasting report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    if (!data?.forecasts) return { highRiskCount: 0, totalReorderItems: 0, avgDemand: 0 };
    const forecasts = data.forecasts;
    const highRisk = forecasts.filter((f) => f.riskLevel === "High").length;
    const reorders = forecasts.filter((f) => f.recommendedReorder > 0).length;
    const totalDemand = forecasts.reduce((sum, f) => sum + f.predictedDemand, 0);
    const avg = forecasts.length > 0 ? Math.round((totalDemand / forecasts.length) * 10) / 10 : 0;

    return {
      highRiskCount: highRisk,
      totalReorderItems: reorders,
      avgDemand: avg,
    };
  }, [data]);

  // Categories list
  const categories = useMemo(() => {
    if (!data?.forecasts) return ["All"];
    const cats = new Set(data.forecasts.map((f) => f.category));
    return ["All", ...Array.from(cats).sort()];
  }, [data]);

  // Filtered forecasts
  const filteredForecasts = useMemo(() => {
    if (!data?.forecasts) return [];
    return data.forecasts.filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || f.category === selectedCategory;
      const matchesRisk = selectedRisk === "All" || f.riskLevel === selectedRisk;
      return matchesSearch && matchesCategory && matchesRisk;
    });
  }, [data, searchQuery, selectedCategory, selectedRisk]);

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Demand Intelligence</h1>
            <p className="text-sm text-slate-500 mt-1">
              Inventory Intelligence Platform — Explainable retail demand forecasting and depletion alerts.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ForecastCard
            title="High Risk Products"
            value={stats.highRiskCount}
            subtitle="Immediate restock recommended"
            status={stats.highRiskCount > 0 ? "danger" : "success"}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            }
          />
          <ForecastCard
            title="Avg Monthly Demand"
            value={`${stats.avgDemand} units`}
            subtitle="Weighted Moving Average forecast"
            status="info"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            }
          />
          <ForecastCard
            title="Items to Reorder"
            value={stats.totalReorderItems}
            subtitle="Restock recommended based on WMA"
            status={stats.totalReorderItems > 0 ? "warning" : "success"}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            }
          />
        </div>

        {/* Explainability & Methodology Section */}
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100/50 p-6 rounded-2xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-violet-600/10 text-violet-700 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-800">Forecasting Methodology</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                VyapariOne implements a <span className="font-semibold text-violet-700">Weighted Moving Average (WMA)</span> demand forecasting engine.
                Recent month sales carry higher statistical weight than older months, making the algorithm highly responsive to recent purchase patterns.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-violet-100 text-violet-800 rounded">10%</span> {data?.monthLabels[0] || "Month -4"}
                </span>
                <span>&rarr;</span>
                <span className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-violet-100 text-violet-800 rounded">15%</span> {data?.monthLabels[1] || "Month -3"}
                </span>
                <span>&rarr;</span>
                <span className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-violet-100 text-violet-800 rounded">20%</span> {data?.monthLabels[2] || "Month -2"}
                </span>
                <span>&rarr;</span>
                <span className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-violet-100 text-violet-800 rounded">25%</span> {data?.monthLabels[3] || "Month -1"}
                </span>
                <span>&rarr;</span>
                <span className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-violet-600 text-white rounded">30%</span> {data?.monthLabels[4] || "Current Month"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or suppliers..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 bg-white"
              />
              <svg
                className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 bg-white text-slate-600 font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 bg-white text-slate-600 font-medium"
              >
                <option value="All">Risk: All</option>
                <option value="High">High Risk</option>
                <option value="Moderate">Moderate Risk</option>
                <option value="Low">Low Risk</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {error ? (
              <div className="p-12 text-center text-rose-500">{error}</div>
            ) : filteredForecasts.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No products match your filters.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Sales History ({data?.monthLabels.join(" → ")})
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">30D Forecast</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Depletion Timeline</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk Level</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recommended Reorder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredForecasts.map((forecast) => {
                    const isLowStock = forecast.currentStock <= forecast.threshold;
                    return (
                      <tr key={forecast.productId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{forecast.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">Supplier: {forecast.supplier}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {forecast.currentStock} units
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">Threshold: {forecast.threshold}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {forecast.monthlySalesHistory.map((qty, idx) => (
                              <span
                                key={idx}
                                title={`${data?.monthLabels[idx]}: ${qty} sold`}
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  idx === 4
                                    ? "bg-violet-100 text-violet-700 font-bold"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {qty}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-100">
                            {forecast.predictedDemand} units
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {forecast.stockDepletionTime === null ? (
                            <span className="text-xs text-slate-500 font-medium">Stable (No demand)</span>
                          ) : (
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded ${
                                forecast.stockDepletionTime <= 7
                                  ? "bg-rose-50 text-rose-600 border border-rose-100 animate-pulse"
                                  : forecast.stockDepletionTime <= 21
                                  ? "bg-amber-50 text-amber-600 border border-amber-100"
                                  : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              }`}
                            >
                              {forecast.stockDepletionTime} days
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <RiskBadge level={forecast.riskLevel} />
                        </td>
                        <td className="px-6 py-4">
                          {forecast.recommendedReorder > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                              Order {forecast.recommendedReorder} units
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 px-3 py-1.5">
                              Adequate Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default DemandIntelligence;
