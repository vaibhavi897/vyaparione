import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import MainLayout from "../layouts/MainLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import DeleteModal from "../components/DeleteModal";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStock, setFilterStock] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" or "edit"
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [threshold, setThreshold] = useState("");
  const [price, setPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  
  // Validation errors
  const [errors, setErrors] = useState({});

  // User Role Check
  const isAdmin = localStorage.getItem("role") === "admin";

  const fetchProductsList = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products. Check server connection.");
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, []);

  const openAddModal = () => {
    setModalType("add");
    setName("");
    setCategory("");
    setQuantity("");
    setThreshold("");
    setPrice("");
    setSupplier("");
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalType("edit");
    setSelectedProductId(product._id);
    setName(product.name);
    setCategory(product.category);
    setQuantity(product.quantity);
    setThreshold(product.threshold);
    setPrice(product.price);
    setSupplier(product.supplier);
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Product name is required.";
    if (!category.trim()) newErrors.category = "Category is required.";
    if (quantity === "" || Number(quantity) < 0) newErrors.quantity = "Quantity must be 0 or greater.";
    if (threshold === "" || Number(threshold) < 0) newErrors.threshold = "Threshold must be 0 or greater.";
    if (price === "" || Number(price) <= 0) newErrors.price = "Price must be greater than 0.";
    if (!supplier.trim()) newErrors.supplier = "Supplier is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name,
      category,
      quantity: Number(quantity),
      threshold: Number(threshold),
      price: Number(price),
      supplier,
    };

    try {
      if (modalType === "add") {
        await addProduct(payload);
        toast.success("Product successfully added!");
      } else {
        await updateProduct(selectedProductId, payload);
        toast.success("Product successfully updated!");
      }
      setIsModalOpen(false);
      fetchProductsList();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save product.";
      toast.error(msg);
      setErrors({ form: msg });
    }
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete._id);
      toast.success("Product successfully deleted!");
      setIsDeleteModalOpen(false);
      fetchProductsList();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product.");
    }
  };

  // Derived state
  const categories = ["All", ...new Set(products.map(p => p.category))];
  const lowStockCount = products.filter((p) => p.quantity <= p.threshold).length;

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    if (filterCategory !== "All") {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    if (filterStock === "Low Stock") {
      filtered = filtered.filter(p => p.quantity <= p.threshold);
    }

    return filtered;
  }, [products, searchQuery, filterCategory, filterStock]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset pagination if filters change and current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Products Inventory</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your inventory items and stock levels.</p>
          </div>
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-violet-600/20 flex items-center gap-2 self-start sm:self-auto"
            >
              Add Product
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm font-semibold text-rose-600">
            {error}
          </div>
        )}

        {/* Controls Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by product name or category..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-sm transition-all shadow-sm"
            />
          </div>
          <div>
            <select 
              value={filterCategory} 
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all shadow-sm"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <select 
              value={filterStock} 
              onChange={(e) => { setFilterStock(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all shadow-sm"
            >
              <option value="All">All Stock Levels</option>
              <option value="Low Stock">Low Stock ({lowStockCount})</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm shadow-slate-100/50 overflow-hidden">
          {loading ? (
            <LoadingSpinner type="table" />
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-2xl">📦</div>
              <p className="text-slate-800 font-bold mb-1">No Products Available</p>
              <p className="text-slate-400 text-sm mb-4">
                {searchQuery || filterCategory !== "All" || filterStock !== "All" 
                  ? "Adjust your filters to see results." 
                  : "Add your first product to get started."}
              </p>
              {isAdmin && !searchQuery && filterCategory === "All" && filterStock === "All" && (
                 <button onClick={openAddModal} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700">Add First Product</button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">Quantity</th>
                    <th className="px-6 py-4 text-center">Threshold</th>
                    <th className="px-6 py-4 text-right">Price</th>
                    <th className="px-6 py-4">Supplier</th>
                    {isAdmin && <th className="px-6 py-4 text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentItems.map((product) => {
                    const isLowStock = product.quantity <= product.threshold;
                    return (
                      <tr
                        key={product._id}
                        className={`hover:bg-slate-50/50 transition-colors ${
                          isLowStock ? "bg-rose-50/30" : ""
                        }`}
                      >
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          <div className="flex items-center gap-2">
                            {product.name}
                            {isLowStock && (
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-100 text-rose-600 border border-rose-200">
                                Low
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-500">{product.category}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-semibold ${isLowStock ? "text-rose-600" : "text-slate-800"}`}>
                            {product.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-400">{product.threshold}</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-800">
                          ₹{product.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-500">{product.supplier}</td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditModal(product)}
                                className="px-2.5 py-1 text-xs font-semibold text-violet-600 hover:text-white hover:bg-violet-600 border border-violet-200 hover:border-violet-600 rounded transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => confirmDelete(product)}
                                className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <span className="text-sm text-slate-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items
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

      {/* Delete Confirmation Modal */}
      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product?"
        message={`This action cannot be undone. Are you sure you want to delete "${productToDelete?.name}"?`}
      />

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-100 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">
                {modalType === "add" ? "Add New Product" : "Edit Product"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleModalSubmit}>
              <div className="p-6 space-y-4">
                {errors.form && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs font-semibold text-rose-600">
                    {errors.form}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Product Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 ${errors.name ? 'border-rose-400' : 'border-slate-200'}`}
                  />
                  {errors.name && <p className="text-[10px] text-rose-500 mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 ${errors.category ? 'border-rose-400' : 'border-slate-200'}`}
                    />
                    {errors.category && <p className="text-[10px] text-rose-500 mt-1">{errors.category}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Supplier</label>
                    <input
                      type="text"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 ${errors.supplier ? 'border-rose-400' : 'border-slate-200'}`}
                    />
                    {errors.supplier && <p className="text-[10px] text-rose-500 mt-1">{errors.supplier}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Quantity</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 ${errors.quantity ? 'border-rose-400' : 'border-slate-200'}`}
                    />
                    {errors.quantity && <p className="text-[10px] text-rose-500 mt-1">{errors.quantity}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Threshold</label>
                    <input
                      type="number"
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 ${errors.threshold ? 'border-rose-400' : 'border-slate-200'}`}
                    />
                    {errors.threshold && <p className="text-[10px] text-rose-500 mt-1">{errors.threshold}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 ${errors.price ? 'border-rose-400' : 'border-slate-200'}`}
                    />
                    {errors.price && <p className="text-[10px] text-rose-500 mt-1">{errors.price}</p>}
                  </div>
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
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-violet-600/20 transition-all"
                >
                  {modalType === "add" ? "Save Product" : "Update Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Products;
