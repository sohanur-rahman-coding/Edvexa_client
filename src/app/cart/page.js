"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import confetti from "canvas-confetti";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building2,
  Truck,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, itemCount, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  // Shipping Form State
  const [shipping, setShipping] = useState({
    street: "742 Evergreen Terrace",
    city: "Springfield",
    state: "Oregon",
    zipCode: "97477",
    country: "USA",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  // Initialize Idempotency Key on mount to ensure network retries do not duplicate orders
  useEffect(() => {
    const key = `order_idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setIdempotencyKey(key);
  }, []);

  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const shippingFee = subtotal > 100 || subtotal === 0 ? 0 : 15;
  const total = Math.round((subtotal + tax + shippingFee) * 100) / 100;

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in or register to place your order.");
      window.location.href = "/signin?redirect=/cart";
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!shipping.street || !shipping.city || !shipping.country) {
      toast.error("Please fill in all required shipping address fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingAddress: shipping,
        notes: notes ? `${notes} | Payment: ${paymentMethod}` : `Payment: ${paymentMethod}`,
        idempotencyKey,
      };

      const res = await api.orders.create(orderPayload, idempotencyKey);

      if (res?.success && res.data) {
        // Trigger celebratory confetti animation
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        toast.success("Order placed successfully! Inventory reserved.");
        clearCart();
        window.location.href = "/orders";
      }
    } catch (err) {
      toast.error(err.message || "Checkout failed. Please check stock availability.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Your Cart is Empty</h2>
        <p className="text-sm text-slate-400">
          Explore our catalog of high-performance tech and add items to your cart.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Shopping Cart & Checkout
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your items and proceed with guaranteed atomic inventory reservation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs font-semibold text-slate-300">
                Items ({itemCount})
              </span>
              <button
                onClick={clearCart}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                Clear Cart
              </button>
            </div>

            <div className="divide-y divide-slate-800/60">
              {items.map((item) => (
                <div key={item.productId} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ${Number(item.price).toFixed(2)} each
                    </p>
                    <span className="text-[10px] text-indigo-400 font-medium">
                      Max available: {item.maxStock}
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2.5 text-xs font-bold text-white min-w-[1.75rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-white block">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors mt-1"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Idempotency Notice */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-3 text-xs text-indigo-200">
            <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-indigo-300">
                Idempotent Checkout Protected:
              </span>{" "}
              This request is guarded with key{" "}
              <code className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-500/30 font-mono text-[10px] text-amber-300">
                {idempotencyKey}
              </code>
              . If your connection drops or you double-click, duplicate charges and double inventory deductions are mathematically prevented.
            </div>
          </div>
        </div>

        {/* Right Column: Shipping & Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleCheckout} className="space-y-6">
            {/* Shipping Details */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-400" /> Shipping Destination
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={shipping.street}
                    onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={shipping.state}
                      onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={shipping.country}
                      onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">
                      Postal / ZIP Code
                    </label>
                    <input
                      type="text"
                      value={shipping.zipCode}
                      onChange={(e) => setShipping({ ...shipping, zipCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Payment Selector */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Payment Method (Simulated)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === "card"
                      ? "border-indigo-500 bg-indigo-950/40 text-white shadow-md shadow-indigo-500/10"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  <span>Credit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("transfer")}
                  className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === "transfer"
                      ? "border-indigo-500 bg-indigo-950/40 text-white shadow-md shadow-indigo-500/10"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>Bank (4% Off)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === "cod"
                      ? "border-indigo-500 bg-indigo-950/40 text-white shadow-md shadow-indigo-500/10"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <Truck className="w-4 h-4 text-indigo-400" />
                  <span>Cash on Deliv.</span>
                </button>
              </div>
            </div>

            {/* Order Price Summary Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Estimated Tax (5%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Shipping Fee</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald-400 font-semibold">FREE</span>
                    ) : (
                      `$${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-base text-indigo-400">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-xl shadow-indigo-500/25 active:scale-95"
              >
                {isSubmitting ? (
                  <span>Reserving Inventory & Creating Order...</span>
                ) : (
                  <>
                    <span>Place Order & Reserve Inventory</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {!isAuthenticated && (
                <p className="text-[11px] text-amber-300 text-center pt-1">
                  * You will be prompted to sign in before finalizing.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
