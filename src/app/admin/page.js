"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import {
  ShieldCheck,
  Package,
  Layers,
  DollarSign,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  TrendingUp,
  RefreshCw,
  Search,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" | "products" | "orders"
  const [loading, setLoading] = useState(true);

  // Data states
  const [inventoryStats, setInventoryStats] = useState(null);
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [orderStats, setOrderStats] = useState(null);

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "Laptops",
    imageUrl: "",
  });

  // Action states
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [adjustingStockId, setAdjustingStockId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, ordRes] = await Promise.all([
        api.inventory.getInventory(),
        api.orders.getAll({ limit: 50 }),
      ]);

      if (invRes?.success) {
        setInventoryStats(invRes.stats);
        setInventoryProducts(invRes.data);
      }

      if (ordRes?.success) {
        setOrdersData(ordRes.data);
        setOrderStats(ordRes.stats);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
      toast.error(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        toast.error("Access restricted: Administrator role required.");
        window.location.href = "/signin?redirect=/admin";
      } else {
        fetchData();
      }
    }
  }, [authLoading, isAdmin]);

  // Handle Product Create / Update
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: productForm.title.trim(),
        description: productForm.description.trim(),
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock, 10),
        category: productForm.category.trim(),
        imageUrl: productForm.imageUrl.trim() || undefined,
      };

      if (editingProduct) {
        await api.products.update(editingProduct.id, payload);
        toast.success(`"${payload.title}" updated successfully!`);
      } else {
        await api.products.create(payload);
        toast.success(`"${payload.title}" created successfully!`);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setProductForm({
        title: "",
        description: "",
        price: "",
        stock: "",
        category: "Laptops",
        imageUrl: "",
      });
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to save product");
    }
  };

  const handleDeleteClick = async (productId, title) => {
    // 2-step click confirmation
    if (deletingProductId !== productId) {
      setDeletingProductId(productId);
      toast(`Click again to confirm deleting "${title}"`, { icon: "⚠️", duration: 4000 });
      setTimeout(() => {
        setDeletingProductId((prev) => (prev === productId ? null : prev));
      }, 5000);
      return;
    }

    setDeletingProductId(null);
    try {
      await api.products.delete(productId);
      toast.success(`"${title}" deleted successfully`);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to delete product");
    }
  };

  // Handle Stock Quick Adjust
  const handleAdjustStock = async (productId, operation, amount) => {
    setAdjustingStockId(productId);
    try {
      const res = await api.inventory.adjustStock(productId, operation, amount);
      if (res?.success) {
        toast.success(res.message || "Stock level updated!");
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update stock");
    } finally {
      setAdjustingStockId(null);
    }
  };

  // Handle Order Lifecycle Progression
  const handleAdvanceOrderStatus = async (orderId, nextStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await api.orders.updateStatus(orderId, nextStatus, `Status updated to ${nextStatus} by Admin.`);
      toast.success(`Order advanced to "${nextStatus}"!`);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to advance order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto py-10 space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-800/40 rounded-2xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Admin Control Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Admin RBAC
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time management for catalog products, atomic inventory levels, and order fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-800 hover:bg-slate-900 text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm({
                title: "",
                description: "",
                price: "",
                stock: "",
                category: "Laptops",
                imageUrl: "",
              });
              setIsProductModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Orders</span>
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {orderStats?.totalOrders || 0}
          </p>
          <p className="text-[11px] text-slate-400">All customer checkouts</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">
            ${Number(orderStats?.totalRevenue || 0).toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400">Excluding cancelled orders</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300">
            {inventoryStats?.lowStockCount || 0}
          </p>
          <p className="text-[11px] text-slate-400">Items with 5 or fewer units</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">
            {inventoryStats?.outOfStockCount || 0}
          </p>
          <p className="text-[11px] text-slate-400">Stock depleted to 0</p>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { key: "inventory", label: "Inventory Manager", icon: Layers },
          { key: "products", label: "Product Catalog CRUD", icon: Package },
          { key: "orders", label: "Fulfillment Pipeline", icon: Truck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: INVENTORY MANAGEMENT */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Unit Price</th>
                    <th className="py-3 px-4">Stock Level</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Stock Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {inventoryProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {p.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{p.category}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        ${Number(p.price).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {p.stock} units
                      </td>
                      <td className="py-3.5 px-4">
                        {p.stock > 10 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                            In Stock
                          </span>
                        ) : p.stock > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-500/30">
                            Low Stock ({p.stock})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950 text-rose-400 border border-rose-500/30">
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAdjustStock(p.id, "decrement", 1)}
                            disabled={p.stock <= 0 || adjustingStockId === p.id}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 disabled:opacity-30 cursor-pointer transition-colors"
                            title="Decrement stock by 1"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleAdjustStock(p.id, "increment", 5)}
                            disabled={adjustingStockId === p.id}
                            className="px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 text-xs font-bold cursor-pointer transition-colors"
                            title="Restock +5 units"
                          >
                            +5 Restock
                          </button>
                          <button
                            onClick={() => handleAdjustStock(p.id, "increment", 20)}
                            disabled={adjustingStockId === p.id}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 cursor-pointer transition-colors"
                            title="Restock +20 units"
                          >
                            +20 Restock
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT CRUD */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventoryProducts.map((p) => {
              const isConfirmingDelete = deletingProductId === p.id;
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-indigo-400">
                        {p.category}
                      </span>
                      <h4 className="text-sm font-bold text-white line-clamp-1">
                        {p.title}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-white">
                      ${Number(p.price).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <span>Stock: <strong>{p.stock}</strong></span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setProductForm({
                            title: p.title,
                            description: p.description || "",
                            price: p.price,
                            stock: p.stock,
                            category: p.category,
                            imageUrl: p.imageUrl || "",
                          });
                          setIsProductModalOpen(true);
                        }}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(p.id, p.title)}
                        className={`p-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          isConfirmingDelete
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-rose-950/40 hover:bg-rose-900/60 text-rose-400"
                        }`}
                        title="Delete Product"
                      >
                        {isConfirmingDelete ? "Confirm Delete?" : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ORDER FULFILLMENT PIPELINE */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items Ordered</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Lifecycle Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {ordersData.map((order) => {
                    const isBusy = updatingOrderId === order.id;
                    return (
                      <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white block">
                            #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-white block">
                            {order.customerName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {order.customerEmail}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {order.items?.length} product(s)
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          ${Number(order.pricing?.total || 0).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.status === "Delivered"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                                : order.status === "Shipped"
                                ? "bg-sky-950 text-sky-400 border border-sky-500/30"
                                : order.status === "Confirmed"
                                ? "bg-indigo-950 text-indigo-400 border border-indigo-500/30"
                                : order.status === "Cancelled"
                                ? "bg-rose-950 text-rose-400 border border-rose-500/30"
                                : "bg-amber-950 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {order.status === "Pending" && (
                              <button
                                onClick={() => handleAdvanceOrderStatus(order.id, "Confirmed")}
                                disabled={isBusy}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] cursor-pointer shadow-sm transition-all"
                              >
                                {isBusy ? "Updating..." : "Confirm"}
                              </button>
                            )}
                            {order.status === "Confirmed" && (
                              <button
                                onClick={() => handleAdvanceOrderStatus(order.id, "Shipped")}
                                disabled={isBusy}
                                className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] cursor-pointer shadow-sm transition-all"
                              >
                                {isBusy ? "Updating..." : "Ship"}
                              </button>
                            )}
                            {order.status === "Shipped" && (
                              <button
                                onClick={() => handleAdvanceOrderStatus(order.id, "Delivered")}
                                disabled={isBusy}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer shadow-sm transition-all"
                              >
                                {isBusy ? "Updating..." : "Mark Delivered"}
                              </button>
                            )}
                            {["Pending", "Confirmed"].includes(order.status) && (
                              <button
                                onClick={() => handleAdvanceOrderStatus(order.id, "Cancelled")}
                                disabled={isBusy}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/30 font-bold text-[10px] cursor-pointer transition-all"
                              >
                                {isBusy ? "Restoring..." : "Cancel & Restock"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingProduct ? "Edit Product" : "Create New Product"}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Initial Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Laptops">Laptops</option>
                    <option value="Audio">Audio</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Monitors">Monitors</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
