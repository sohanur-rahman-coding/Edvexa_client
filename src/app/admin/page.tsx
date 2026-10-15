"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Product, Order, InventoryStats, OrderStats, OrderStatus } from "@/types";
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
  SlidersHorizontal,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading, loginAsDemoAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<"inventory" | "products" | "orders">("inventory");
  const [loading, setLoading] = useState(true);

  // Data states
  const [inventoryStats, setInventoryStats] = useState<InventoryStats | null>(null);
  const [inventoryProducts, setInventoryProducts] = useState<Product[]>([]);
  const [ordersData, setOrdersData] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);

  // Filter & Search states
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState<"all" | "low" | "out">("all");
  const [orderFilter, setOrderFilter] = useState<string>("all");

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "Laptops",
    imageUrl: "",
  });

  // Action states
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [adjustingStockId, setAdjustingStockId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, ordRes] = await Promise.all([
        api.inventory.getInventory(),
        api.orders.getAll({ limit: 50 }),
      ]);

      if (invRes?.success) {
        setInventoryStats(invRes.stats);
        setInventoryProducts(invRes.data || []);
      }

      if (ordRes?.success) {
        setOrdersData(ordRes.data || []);
        setOrderStats(ordRes.stats);
      }
    } catch (err: any) {
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
        router.push("/signin?redirect=/admin");
      } else {
        fetchData();
      }
    }
  }, [authLoading, isAdmin]);

  // Handle Product Create / Update
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Product> = {
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
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    }
  };

  const handleDeleteClick = async (productId: string, title: string) => {
    if (deletingProductId !== productId) {
      setDeletingProductId(productId);
      toast(`Click again to confirm deleting "${title}"`, { icon: "⚠️", duration: 4000 });
      setTimeout(() => {
        setDeletingProductId((prev) => (prev === productId ? null : prev));
      }, 5000);
      return;
    }

    try {
      await api.products.delete(productId);
      toast.success(`"${title}" deleted successfully!`);
      setDeletingProductId(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    }
  };

  const handleAdjustStock = async (
    productId: string,
    operation: "add" | "set" | "deduct" | "increment" | "decrement",
    amount: number
  ) => {
    setAdjustingStockId(productId);
    try {
      const res = await api.inventory.adjustStock(productId, operation, amount);
      if (res?.success) {
        const updatedStock = res.data?.newStock ?? (res.data as any)?.stock;
        toast.success(`Stock updated to ${updatedStock ?? "new"} units`);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to adjust stock");
    } finally {
      setAdjustingStockId(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await api.orders.updateStatus(orderId, newStatus);
      if (res?.success) {
        toast.success(`Order marked as "${newStatus}"`);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      title: p.title,
      description: p.description || "",
      price: String(p.price),
      stock: String(p.stock),
      category: p.category,
      imageUrl: p.imageUrl,
    });
    setIsProductModalOpen(true);
  };

  const filteredInventory = inventoryProducts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p.category.toLowerCase().includes(inventorySearch.toLowerCase());

    if (!matchesSearch) return false;
    if (inventoryFilter === "low") return p.stock > 0 && p.stock <= 5;
    if (inventoryFilter === "out") return p.stock <= 0;
    return true;
  });

  const filteredOrders = ordersData.filter((o) => {
    if (orderFilter === "all") return true;
    return o.status === orderFilter;
  });

  if (authLoading || (loading && !inventoryStats)) {
    return (
      <div className="max-w-7xl mx-auto py-10 space-y-6">
        <div className="h-8 w-64 skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
              <div className="h-3 w-1/2 skeleton" />
              <div className="h-7 w-1/3 skeleton" />
              <div className="h-3 w-2/3 skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Administrator Access Required</h2>
        <p className="text-xs text-slate-500 font-medium">
          This portal is restricted to authorized administrators. Click below to sign in with demo admin credentials.
        </p>
        <button
          onClick={() => loginAsDemoAdmin()}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
        >
          Sign In as Demo Admin 👑
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8 pb-20 page-enter">
      {/* Top Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
              Control Panel
            </span>
            <span className="text-xs text-slate-500 font-medium">Logged in as <span className="font-bold text-slate-700">{user?.name}</span></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage products, inventory, and order fulfilment pipeline</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 hover:text-emerald-800 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            Refresh Data
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm({ title: "", description: "", price: "", stock: "", category: "Laptops", imageUrl: "" });
              setIsProductModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Inventory Value",
            value: `$${inventoryStats?.totalInventoryValuation ? Number(inventoryStats.totalInventoryValuation).toLocaleString() : "0"}`,
            sub: "Based on live stock",
            icon: DollarSign,
            iconBg: "bg-emerald-50 border-emerald-200",
            iconColor: "text-emerald-600",
            valueColor: "text-slate-900",
          },
          {
            label: "Catalog Products",
            value: inventoryStats?.totalProducts || 0,
            sub: `${inventoryStats?.totalStockUnits || 0} physical units`,
            icon: Layers,
            iconBg: "bg-teal-50 border-teal-200",
            iconColor: "text-teal-600",
            valueColor: "text-slate-900",
          },
          {
            label: "Low Stock Alerts",
            value: inventoryStats?.lowStockCount || 0,
            sub: "Products with ≤ 5 units",
            icon: AlertTriangle,
            iconBg: "bg-amber-50 border-amber-200",
            iconColor: "text-amber-500",
            valueColor: "text-amber-600",
          },
          {
            label: "Total Orders",
            value: orderStats?.totalOrders || ordersData.length || 0,
            sub: `$${orderStats?.totalRevenue ? Number(orderStats.totalRevenue).toLocaleString() : "0"} revenue`,
            icon: PackageCheck,
            iconBg: "bg-green-50 border-green-200",
            iconColor: "text-green-600",
            valueColor: "text-slate-900",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="stat-card group">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-slate-500 font-semibold">{card.label}</p>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
              <p className={`text-2xl font-black ${card.valueColor}`}>{card.value}</p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">{card.sub}</p>
            </div>
          );
        })}
      </section>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-0 -mb-px">
        {[
          { id: "inventory", label: "Inventory", icon: Package },
          { id: "products", label: "Products", icon: Layers },
          { id: "orders", label: `Orders (${ordersData.length})`, icon: Truck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer border-b-2 rounded-t-xl ${
                isActive
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/60"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: INVENTORY MANAGEMENT */}
      {activeTab === "inventory" && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search inventory items..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setInventoryFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  inventoryFilter === "all" ? "bg-slate-800 text-white" : "text-slate-600 bg-white border border-slate-200 hover:text-slate-900"
                }`}
              >
                All ({inventoryProducts.length})
              </button>
              <button
                onClick={() => setInventoryFilter("low")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  inventoryFilter === "low" ? "bg-amber-100 text-amber-900 border border-amber-300" : "text-slate-600 bg-white border border-slate-200 hover:text-slate-900"
                }`}
              >
                Low Stock
              </button>
              <button
                onClick={() => setInventoryFilter("out")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  inventoryFilter === "out" ? "bg-rose-100 text-rose-900 border border-rose-300" : "text-slate-600 bg-white border border-slate-200 hover:text-slate-900"
                }`}
              >
                Out of Stock
              </button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock Level</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Stock Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={item.imageUrl || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80"}
                          alt={item.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80";
                          }}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                        />
                        <span className="font-bold text-slate-900 max-w-xs truncate">{item.title}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{item.category}</td>
                      <td className="py-3 px-4 font-black text-slate-900">${Number(item.price).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-sm text-slate-900">{item.stock}</span>
                        <span className="text-slate-400 text-[11px] ml-1">units</span>
                      </td>
                      <td className="py-3 px-4">
                        {item.stock > 10 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Healthy
                          </span>
                        ) : item.stock > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                            Sold Out
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAdjustStock(item.id || (item as any)._id, "increment", 5)}
                            disabled={adjustingStockId === (item.id || (item as any)._id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition-all cursor-pointer shadow-xs disabled:opacity-40"
                            title="Add 5 units to stock"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleAdjustStock(item.id || (item as any)._id, "decrement", 1)}
                            disabled={adjustingStockId === (item.id || (item as any)._id) || item.stock <= 0}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 transition-all cursor-pointer disabled:opacity-30 shadow-xs"
                            title="Deduct 1 unit from stock"
                          >
                            -1
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: PRODUCT CATALOG CRUD */}
      {activeTab === "products" && (
        <section className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventoryProducts.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex gap-3">
                  <img
                    src={p.imageUrl || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80"}
                    alt={p.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80";
                    }}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{p.title}</h3>
                    <p className="text-xs text-emerald-700 font-bold">${Number(p.price).toFixed(2)}</p>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">Stock: {p.stock} units</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">{p.category}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 transition-colors cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(p.id, p.title)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        deletingProductId === p.id
                          ? "bg-rose-600 text-white animate-pulse"
                          : "bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200"
                      }`}
                      title={deletingProductId === p.id ? "Click to confirm delete" : "Delete Product"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: ORDERS FULFILLMENT PIPELINE */}
      {activeTab === "orders" && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {["all", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setOrderFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${
                  orderFilter === st
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-emerald-700 bg-white border border-slate-200"
                }`}
              >
                {st === "all" ? `All (${ordersData.length})` : st}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-700">
                      {ord.orderNumber}
                    </span>
                    <span className="text-xs text-slate-800 font-bold">by {ord.customerName}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({ord.customerEmail})</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {ord.items.map((i) => `${i.title} (x${i.quantity})`).join(", ")}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Destination: {ord.shippingAddress?.street}, {ord.shippingAddress?.city} • Total: ${Number(ord.total).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Status:</span>
                    <select
                      value={ord.status}
                      disabled={updatingOrderId === ord.id || ord.status === "Cancelled"}
                      onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                      className="bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setIsProductModalOpen(false); }}>
          <div className="max-w-lg w-full rounded-3xl bg-white border border-slate-200 p-7 space-y-5 shadow-2xl animate-bounce-scale origin-center">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                {editingProduct && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{editingProduct.title}</p>}
              </div>
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Product Title *</label>
                <input
                  type="text" required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:bg-white transition-all"
                  placeholder="e.g. Mechanical Keyboard Pro"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:bg-white transition-all resize-none"
                  placeholder="Product specs, features..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Price (USD) *</label>
                  <input
                    type="number" step="0.01" min="0" required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:bg-white transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Stock Units *</label>
                  <input
                    type="number" min="0" required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:bg-white transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Category *</label>
                  <input
                    type="text" required
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:bg-white transition-all"
                    placeholder="e.g. Laptops"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Image URL</label>
                  <input
                    type="text"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:bg-white transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm text-slate-600 hover:text-slate-900 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
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
