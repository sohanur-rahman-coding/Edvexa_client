"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Order, OrderStatus } from "@/types";
import { toast } from "react-hot-toast";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  MapPin,
} from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.orders.getMyOrders();
      if (res?.success && res.data) {
        setOrders(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load orders:", err);
      toast.error(err.message || "Failed to load order history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/signin?redirect=/orders");
      } else {
        fetchOrders();
      }
    }
  }, [authLoading, isAuthenticated]);

  const handleCancelClick = async (orderId: string) => {
    if (confirmCancelId !== orderId) {
      setConfirmCancelId(orderId);
      toast("Click again to confirm cancellation. Reserved stock will be restored.", {
        icon: "⚠️",
        duration: 4000,
      });
      setTimeout(() => {
        setConfirmCancelId((prev) => (prev === orderId ? null : prev));
      }, 5000);
      return;
    }

    setConfirmCancelId(null);
    setCancellingOrderId(orderId);
    try {
      const res = await api.orders.cancel(orderId, "Customer cancelled this order.");
      if (res?.success) {
        toast.success("Order cancelled! Product inventory has been atomically restored to stock.");
        fetchOrders();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getLifecycleStep = (status: OrderStatus) => {
    const steps: OrderStatus[] = ["Pending", "Confirmed", "Shipped", "Delivered"];
    return steps.indexOf(status);
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "active") return ["Pending", "Confirmed", "Shipped"].includes(order.status);
    if (selectedFilter === "delivered") return order.status === "Delivered";
    if (selectedFilter === "cancelled") return order.status === "Cancelled";
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto py-10 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-xl" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 pb-16">
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Order Fulfillment & Lifecycle Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time status tracking and inventory restoration for your purchases.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50/60 text-slate-700 hover:text-emerald-800 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          Refresh Orders
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: "all", label: `All Orders (${orders.length})` },
          { id: "active", label: `In Progress (${orders.filter((o) => ["Pending", "Confirmed", "Shipped"].includes(o.status)).length})` },
          { id: "delivered", label: `Delivered (${orders.filter((o) => o.status === "Delivered").length})` },
          { id: "cancelled", label: `Cancelled (${orders.filter((o) => o.status === "Cancelled").length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === tab.id
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 bg-white border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Orders Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            {selectedFilter === "all"
              ? "You haven't placed any orders yet. Visit our catalog to find top-tier equipment."
              : `No orders match the filter "${selectedFilter}".`}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const currentStep = getLifecycleStep(order.status);
            const isCancelled = order.status === "Cancelled";
            const canCancel = ["Pending", "Confirmed"].includes(order.status);

            return (
              <div
                key={order.id}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all"
              >
                {/* Header Strip */}
                <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-emerald-700">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {order.idempotencyKey && (
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-md">
                        Idempotency Key: {order.idempotencyKey}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === "Delivered"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : order.status === "Shipped"
                          ? "bg-teal-50 text-teal-800 border border-teal-200"
                          : order.status === "Confirmed"
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : order.status === "Cancelled"
                          ? "bg-rose-50 text-rose-800 border border-rose-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {order.status === "Delivered" && <PackageCheck className="w-3.5 h-3.5" />}
                      {order.status === "Shipped" && <Truck className="w-3.5 h-3.5" />}
                      {order.status === "Confirmed" && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {order.status === "Cancelled" && <XCircle className="w-3.5 h-3.5" />}
                      {order.status === "Pending" && <Clock className="w-3.5 h-3.5" />}
                      {order.status}
                    </span>

                    <span className="text-sm font-black text-slate-900">
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Visual Order Lifecycle Step Indicator */}
                {!isCancelled ? (
                  <div className="px-5 py-4 bg-white border-b border-slate-100">
                    <div className="grid grid-cols-4 gap-2 relative">
                      {[
                        { title: "Pending", desc: "Order Logged", icon: Clock },
                        { title: "Confirmed", desc: "Stock Reserved", icon: CheckCircle2 },
                        { title: "Shipped", desc: "In Transit", icon: Truck },
                        { title: "Delivered", desc: "Received", icon: PackageCheck },
                      ].map((step, idx) => {
                        const isDone = currentStep >= idx;
                        const isCurrent = currentStep === idx;
                        const StepIcon = step.icon;

                        return (
                          <div key={step.title} className="text-center relative space-y-1">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all ${
                                isDone
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-slate-100 text-slate-400"
                              } ${isCurrent ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-white animate-pulse" : ""}`}
                            >
                              <StepIcon className="w-4 h-4" />
                            </div>
                            <p
                              className={`text-xs font-bold leading-tight ${
                                isDone ? "text-slate-900" : "text-slate-400"
                              }`}
                            >
                              {step.title}
                            </p>
                            <p className="text-[10px] text-slate-500 hidden sm:block">
                              {step.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-3 bg-rose-50 border-b border-rose-200 flex items-center gap-2 text-xs text-rose-800">
                    <RotateCcw className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span className="font-medium">
                      <strong>Order Cancelled:</strong> Reserved inventory was atomically restored back into the product stock.
                    </span>
                  </div>
                )}

                {/* Items Breakdown */}
                <div className="p-5 space-y-3">
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-800">{item.title}</span>
                          <span className="text-slate-400 font-medium">× {item.quantity}</span>
                        </div>
                        <span className="font-extrabold text-slate-900">
                          ${Number(item.subtotal || item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address & Cancel Button */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-800 font-bold">Deliver to: </span>
                        <span>
                          {order.shippingAddress?.street}, {order.shippingAddress?.city},{" "}
                          {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                        </span>
                      </div>
                    </div>

                    {canCancel && (
                      <button
                        onClick={() => handleCancelClick(order.id)}
                        disabled={cancellingOrderId === order.id}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all self-end sm:self-auto cursor-pointer ${
                          confirmCancelId === order.id
                            ? "bg-rose-600 text-white shadow-xs animate-pulse"
                            : "bg-white hover:bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {cancellingOrderId === order.id
                          ? "Restoring Stock..."
                          : confirmCancelId === order.id
                          ? "⚠️ Click Again to Confirm Cancel"
                          : "Cancel Order & Restore Stock"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
