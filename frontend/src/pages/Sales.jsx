import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import MainLayout from "../layouts/MainLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import { getSales, recordSale } from "../services/saleService";
import { getProducts } from "../services/productService";
import { useAuth } from "../context/AuthContext";

function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantitySold, setQuantitySold] = useState("");
  const [errors, setErrors] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Role check
  const { isAdmin } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [salesData, productsData] = await Promise.all([
        getSales(),
        getProducts()
      ]);
      // Sort sales by date desc
      setSales(salesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setProducts(productsData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load sales database.");
      toast.error("Failed to load sales data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openRecordModal = () => {
    setSelectedProductId("");
    setQuantitySold("");
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedProductId) newErrors.product = "Please select a product.";
    if (quantitySold === "" || Number(quantitySold) <= 0) {
      newErrors.quantity = "Quantity must be greater than zero.";
    } else {
      const product = products.find((p) => p._id === selectedProductId);
      if (product && product.quantity < Number(quantitySold)) {
        newErrors.quantity = `Insufficient stock. Only ${product.quantity} available.`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await recordSale({
        productId: selectedProductId,
        quantitySold: Number(quantitySold)
      });
      toast.success("Sale successfully recorded!");
      setIsModalOpen(false);
      fetchData(); // Reload both products inventory and sales listings
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to record sale.";
      toast.error(msg);
      setErrors({ form: msg });
    }
  };

  const totalPages = Math.ceil(sales.length / itemsPerPage);
  const currentSales = sales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sales Operations</h1>
            <p className="text-sm text-slate-500 mt-1">Record store sales and view transaction history.</p>
          </div>
          {isAdmin && (
            <button
              onClick={openRecordModal}
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-violet-600/20 flex items-center gap-2 self-start sm:self-auto"
            >
              Record Sale
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm font-semibold text-rose-600">
            {error}
          </div>
        )}

        {/* Sales Table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm shadow-slate-100/50 overflow-hidden">
          {loading ? (
            <LoadingSpinner type="table" />
          ) : sales.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-2xl">💰</div>
              <p className="text-slate-800 font-bold mb-1">No Sales Recorded Yet</p>
              <p className="text-slate-400 text-sm mb-4">Start processing orders to see your sales history.</p>
              {isAdmin && (
                <button onClick={openRecordModal} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700">Record First Sale</button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4 text-center">Quantity Sold</th>
                    <th className="px-6 py-4 text-right">Total Amount</th>
                    <th className="px-6 py-4 text-right">Transaction Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentSales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {sale.productId?.name || (
                          <span className="text-slate-400 italic font-normal">Deleted Product</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-800">{sale.quantitySold}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">
                        ₹{(sale.totalAmount ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-400 font-medium">
                        {new Date(sale.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <span className="text-sm text-slate-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sales.length)} of {sales.length} items
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border border-slate-200 rounded text-sm font-semibold text-slate-600 hover:bg-white disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm font-semibold text-slate-700 mx-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 border border-slate-200 rounded text-sm font-semibold text-slate-600 hover:bg-white disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Record Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Record New Sale</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRecordSubmit}>
              <div className="p-6 space-y-4">
                {errors.form && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs font-semibold text-rose-600">
                    {errors.form}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Select Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 ${errors.product ? 'border-rose-400' : 'border-slate-200'}`}
                  >
                    <option value="">-- Choose a Product --</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id} disabled={p.quantity <= 0}>
                        {p.name} (Category: {p.category} | Stock: {p.quantity} | Price: ₹{p.price})
                      </option>
                    ))}
                  </select>
                  {errors.product && <p className="text-[10px] text-rose-500 mt-1">{errors.product}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Quantity Sold
                  </label>
                  <input
                    type="number"
                    value={quantitySold}
                    onChange={(e) => setQuantitySold(e.target.value)}
                    placeholder="e.g. 5"
                    className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 ${errors.quantity ? 'border-rose-400' : 'border-slate-200'}`}
                  />
                  {errors.quantity && <p className="text-[10px] text-rose-500 mt-1">{errors.quantity}</p>}
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={products.length === 0}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-violet-600/20 transition-all"
                >
                  Record Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Sales;
