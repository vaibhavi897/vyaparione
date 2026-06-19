import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { getDashboardStats, getDashboardAnalytics } from "../services/dashboardService";

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [statsData, analyticsData] = await Promise.all([
        getDashboardStats(),
        getDashboardAnalytics()
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <LoadingSpinner type="card" />
             <LoadingSpinner type="card" />
             <LoadingSpinner type="card" />
             <LoadingSpinner type="card" />
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="col-span-2"><LoadingSpinner type="table" /></div>
             <div><LoadingSpinner type="table" /></div>
           </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-xl text-center">
          <p className="text-sm font-semibold text-rose-600">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Inventory Intelligence Platform — Real-time insights and sales analytics.</p>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Section 1: KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 mb-2">Monthly Revenue</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-slate-800">
                ₹{(analytics?.currentMonthRevenue || 0).toLocaleString()}
              </span>
              <span className={`text-xs font-bold ${Number(analytics?.revenueGrowth) >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {Number(analytics?.revenueGrowth) > 0 ? "+" : ""}{analytics?.revenueGrowth}%
              </span>
            </div>
          </div>
          <StatCard title="Inventory Value" value={`₹${(stats?.inventoryValue || 0).toLocaleString()}`} />
          <StatCard title="Total Products" value={stats?.totalProducts || 0} />
          <StatCard title="Low Stock Alerts" value={stats?.lowStockCount || 0} />
        </div>

        {/* Section 2: Charts (Line & Pie) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Line Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col min-h-[380px]">
            <h3 className="text-base font-semibold text-slate-800 mb-6">Revenue Over Time</h3>
            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.monthlyRevenueTrend || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `₹${value}`} dx={-10} />
                  <Tooltip 
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col min-h-[380px]">
            <h3 className="text-base font-semibold text-slate-800 mb-6">Category Distribution</h3>
            <div className="flex-1 w-full min-h-[300px]">
              {(!analytics?.categoryDistribution || analytics.categoryDistribution.length === 0) ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categoryDistribution}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analytics.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#475569' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Top Selling & Recent Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top 5 Products */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Top Selling Products</h3>
            <div className="overflow-x-auto">
              {!analytics?.topSellingProducts || analytics.topSellingProducts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">No sales data.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {analytics.topSellingProducts.map((product, idx) => (
                    <li key={product._id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-100 text-slate-500' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                          {idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-slate-700">{product.name}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        {product.unitsSold} Units
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Recent Sales</h3>
            <div className="overflow-x-auto">
              {stats?.recentSales?.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No recent sales recorded.
                </div>
              ) : (
                <table className="w-full text-left text-sm text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                      <th className="pb-3">Product Name</th>
                      <th className="pb-3 text-center">Qty</th>
                      <th className="pb-3 text-right">Amount</th>
                      <th className="pb-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats?.recentSales?.map((sale) => (
                      <tr key={sale._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 font-medium text-slate-800">
                          {sale.productId?.name || "Deleted Product"}
                        </td>
                        <td className="py-3.5 text-center font-medium">{sale.quantitySold}</td>
                        <td className="py-3.5 text-right font-bold text-slate-800">
                          ₹{sale.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 text-right text-xs text-slate-400">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">Low Stock System Alerts</h3>
              <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-xs font-semibold rounded-full border border-rose-100">
                {stats?.lowStockCount || 0} alert(s)
              </span>
            </div>
            <div className="overflow-x-auto">
              {!stats?.lowStockList || stats.lowStockList.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">No products are currently low in stock.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {stats.lowStockList.map((product) => (
                    <li key={product._id} className="py-3 flex items-center justify-between bg-rose-50/30 px-3 rounded-lg mb-1 border border-rose-100">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{product.name}</p>
                        <p className="text-xs text-slate-500">Category: {product.category}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200">
                          {product.quantity} / Threshold {product.threshold}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;
