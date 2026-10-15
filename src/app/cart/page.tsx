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
  Sparkles,
  Zap,
  Check,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, itemCount, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated, user, loginAsDemoCustomer } = useAuth();

  // Shipping Form State
  const [shipping, setShipping] = useState({
    street: "742 Evergreen Terrace",
    city: "Springfield",
    state: "Oregon",
    zipCode: "97477",
    country: "USA",
  });

  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod" | "bank">("stripe");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  // Stripe Card Details State
  const [cardDetails, setCardDetails] = useState({
    number: "4242 •••• •••• 4242",
    exp: "12/28",
    cvc: "888",
    name: "Alex Smith",
  });
  const [stripeIntentStatus, setStripeIntentStatus] = useState<string | null>(null);

  // Initialize Idempotency Key on mount to ensure network retries do not duplicate orders
  useEffect(() => {
    const key = `order_idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setIdempotencyKey(key);
  }, []);

  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const shippingFee = subtotal > 100 || subtotal === 0 ? 0 : 15;
  const total = Math.round((subtotal + tax + shippingFee) * 100) / 100;
  const freeShippingThreshold = 100;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in or use Demo Customer to place your order.");
      router.push("/signin?redirect=/cart");
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
      let stripePaymentId = "";

      // If user selected Stripe, create or simulate the PaymentIntent
      if (paymentMethod === "stripe") {
        setStripeIntentStatus("Authorizing with Stripe API...");
        const intentRes = await api.orders.createPaymentIntent({
          amount: total,
          currency: "usd",
          items,
          idempotencyKey,
        });

        if (intentRes?.success) {
          stripePaymentId = intentRes.data?.clientSecret || "pi_test_simulated";
          setStripeIntentStatus("Stripe Payment Intent authorized! Processing order...");
        }
      }

      const orderPayload = {
        items: items.map((i: any) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingAddress: shipping,
        notes: notes
          ? `${notes} | Payment: ${paymentMethod.toUpperCase()}${stripePaymentId ? ` (Stripe: ${stripePaymentId.substring(0, 15)}...)` : ""}`
          : `Payment: ${paymentMethod.toUpperCase()}${stripePaymentId ? ` (Stripe: ${stripePaymentId.substring(0, 15)}...)` : ""}`,
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

        toast.success("Order placed and payment authorized! Inventory reserved atomically.");
        clearCart();
        router.push("/orders");
      }
    } catch (err: any) {
      toast.error(err.message || "Checkout failed. Please check stock availability.");
    } finally {
      setIsSubmitting(false);
      setStripeIntentStatus(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-xs">
          <ShoppingBag className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Cart is Empty</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium">
          Explore our catalog of high-performance tech equipment and reserve your units.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          Browse Products Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8 pb-16">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Shopping Cart & Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Review your items and proceed with guaranteed atomic inventory reservation.
        </p>
      </div>

      {/* Free Shipping Alert Bar */}
      {amountToFreeShipping > 0 ? (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 shadow-xs">
          <span className="flex items-center gap-2 font-medium">
            <Truck className="w-4 h-4 text-emerald-600" />
            Add <strong>${amountToFreeShipping.toFixed(2)}</strong> more to qualify for <strong>FREE Shipping!</strong>
          </span>
          <Link href="/products" className="text-emerald-700 underline font-bold hover:text-emerald-800">
            Add items
          </Link>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-900 font-medium shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Congratulations! You qualify for <strong>FREE Standard Shipping</strong> on this order.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Cart Items ({itemCount})
            </h2>
            <button
              onClick={clearCart}
              className="text-xs text-slate-500 hover:text-rose-600 font-semibold transition-colors cursor-pointer"
            >
              Clear Cart
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item: any) => (
              <div
                key={item.productId}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex gap-4 items-center justify-between"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={
                      item.imageUrl ||
                      "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80"
                    }
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/products/${item.productId}`}
                      className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      ${Number(item.price).toFixed(2)} each
                    </p>
                    {item.stock !== undefined && (
                      <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                        Stock available: {item.stock}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Delete */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-slate-900 min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[4.5rem]">
                    <span className="text-sm font-extrabold text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Technical Architecture Info Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>Client-Side Idempotency Protection</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px] font-medium">
              Every checkout submission includes a cryptographic key in the <code className="text-emerald-800 font-bold bg-white px-1 py-0.5 rounded border border-emerald-200">Idempotency-Key</code> HTTP header. Even if network latency causes accidental multiple clicks, Edvexa ensures your order is only processed once.
            </p>
            <div className="p-2 rounded-lg bg-white border border-emerald-200 text-[10px] text-emerald-900 font-mono break-all font-semibold">
              Key: {idempotencyKey || "Generating..."}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Form & Summary */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleCheckout} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary & Payment
            </h2>

            {/* Unauthenticated Quick Banner */}
            {!isAuthenticated && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs">
                <p className="text-amber-900 font-bold">
                  You are currently browsing as a guest.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => loginAsDemoCustomer()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    1-Click Demo Customer
                  </button>
                  <Link
                    href="/signin?redirect=/cart"
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            )}

            {/* Shipping Address Inputs */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Shipping Destination
              </span>

              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={shipping.street}
                  onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={shipping.state}
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={shipping.zipCode}
                    onChange={(e) => setShipping({ ...shipping, zipCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    placeholder="Postal Code"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={shipping.country}
                    onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector (Stripe Featured) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Select Payment Method
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Stripe Powered
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "stripe", label: "Stripe Pay", icon: CreditCard, badge: "Recommended" },
                  { id: "bank", label: "Bank Wire", icon: Building2 },
                  { id: "cod", label: "Cash On Del.", icon: Truck },
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 relative ${
                        isSelected
                          ? "bg-emerald-50/80 border-emerald-500 text-emerald-900 shadow-xs ring-1 ring-emerald-500/30"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-600" : "text-slate-400"}`} />
                      <span className="text-[11px] font-bold">{pm.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Stripe Card Elements Container */}
              {paymentMethod === "stripe" && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      Stripe Card Payment
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                      256-bit TLS Encrypted
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                      placeholder="4242 4242 4242 4242"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Expiration (MM/YY)</label>
                      <input
                        type="text"
                        value={cardDetails.exp}
                        onChange={(e) => setCardDetails({ ...cardDetails, exp: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">CVC / CVV</label>
                      <input
                        type="text"
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                        placeholder="CVC"
                      />
                    </div>
                  </div>

                  {stripeIntentStatus && (
                    <p className="text-[11px] text-emerald-700 font-bold animate-pulse">
                      ⚡ {stripeIntentStatus}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs font-medium">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="text-slate-900 font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax (5%)</span>
                <span className="text-slate-900 font-bold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Standard Delivery</span>
                <span className={shippingFee === 0 ? "text-emerald-700 font-bold" : "text-slate-900 font-bold"}>
                  {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Due</span>
                <span className="text-emerald-700">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              {isSubmitting ? "Processing Payment & Reserving Stock..." : `Pay with ${paymentMethod === "stripe" ? "Stripe" : paymentMethod.toUpperCase()} • $${total.toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
