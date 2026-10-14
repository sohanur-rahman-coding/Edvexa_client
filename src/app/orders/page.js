"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
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
} from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.orders.getMyOrders();
      if (res?.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
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

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order? All items will be restored to stock.")) {
      return;
    }

    setCancellingOrderId(orderId);
    try {
      const res = await api.orders.cancel(orderId, "Customer requested order cancellation.");
      if (res?.success) {
        toast.success("Order cancelled and product inventory successfully restored!");
        fetchOrders(); // Refresh orders list
      }
    } catch (err) {
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getLifecycleStep = (status) => {
    const steps = ["Pending", "Confirmed", "Shipped", "Delivered"];
    return steps.indexOf(status);
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto py-10 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-slate-800/40 rounded-2xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Order History & Fulfillment Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status tracking and inventory restoration for your purchases.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-300 transition-colors"
        >
          Refresh Orders
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl border border-slate-800 bg-slate-900/30 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Orders Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't placed any orders yet. Visit our catalog to find top-tier tech equipment.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStep = getLifecycleStep(order.status);
            const isCancelled = order.status === "Cancelled";
            const canCancel = ["Pending", "Confirmed"].includes(order.status);

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-6 hover:border-slate-700 transition-all shadow-xl"
              >
                {/* Header: Order ID, Date & Total */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </span>
                      {order.idempotencyKey && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Idempotent
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Total</span>
                      <span className="text-base font-extrabold text-white">
                        ${Number(order.pricing?.total || 0).toFixed(2)}
                      </span>
                    </div>

                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrderId === order.id}
                        className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        {cancellingOrderId === order.id ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Visual Order Lifecycle Progression */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                  {isCancelled ? (
                    <div className="flex items-center gap-3 text-rose-400">
                      <XCircle className="w-5 h-5" />
                      <div>
                        <span className="text-xs font-bold block">Order Cancelled</span>
                        <span className="text-[11px] text-slate-400">
                          {order.statusHistory?.slice(-1)[0]?.note || "Order was cancelled and inventory restored to stock."}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 text-center relative">
                      {[
                        { title: "Pending", icon: Clock },
                        { title: "Confirmed", icon: CheckCircle2 },
                        { title: "Shipped", icon: Truck },
                        { title: "Delivered", icon: PackageCheck },
                      ].map((step, idx) => {
                        const Icon = step.icon;
                        const isDone = currentStep >= idx;
                        const isCurrent = currentStep === idx;

                        return (
                          <div key={step.title} className="flex flex-col items-center gap-2 relative z-10">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                isDone
                                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                                  : "bg-slate-900 text-slate-600 border border-slate-800"
                              } ${isCurrent ? "ring-2 ring-indigo-400 animate-pulse" : ""}`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span
                              className={`text-[11px] font-semibold ${
                                isDone ? "text-white" : "text-slate-500"
                              }`}
                            >
                              {step.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Itemized Order Products */}
                <div className="divide-y divide-slate-800/60">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-white">
                        ${Number(item.totalPrice).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer notes & shipping address */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  <span>
                    Destination: {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.country}
                  </span>
                  <span>Payment: {order.paymentStatus || "Paid (Simulated)"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
