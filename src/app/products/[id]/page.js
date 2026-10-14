"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Truck,
  RotateCcw,
  Plus,
  Minus,
} from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, items } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await api.products.getById(id);
        if (res?.success && res.data) {
          setProduct(res.data);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        setError(err.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-slate-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-slate-800 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-slate-800 rounded" />
            <div className="h-6 w-1/4 bg-slate-800 rounded" />
            <div className="h-24 w-full bg-slate-800 rounded" />
            <div className="h-12 w-full bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <p className="text-sm text-slate-400">{error || "The requested product does not exist."}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const cartItem = items.find((i) => i.productId === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const remainingStock = Math.max(0, product.stock - qtyInCart);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    const success = addToCart(product, quantity);
    if (success) {
      setQuantity(1);
    }
  };

  const handleBuyNow = () => {
    const success = addToCart(product, quantity);
    if (success) {
      router.push("/cart");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      {/* Breadcrumb navigation */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Product Image */}
        <div className="relative aspect-square w-full rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover object-center"
          />

          {/* Category Badge */}
          <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-950/80 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
            {product.category}
          </span>
        </div>

        {/* Product Information & Purchase Panel */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {product.title}
            </h1>

            {/* Live Stock Indicator */}
            <div className="pt-1">
              {product.stock > 10 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  In Stock ({product.stock} units available)
                </span>
              ) : product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/30 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Low Stock: Only {product.stock} units remaining!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-500/30">
                  <XCircle className="w-3.5 h-3.5" />
                  Currently Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              ${Number(product.price).toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">USD (Taxes calculated at checkout)</span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Description & Specifications
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {product.description || "Premium high-grade electronic device crafted for durability and high performance."}
            </p>
          </div>

          {/* Quantity and Actions */}
          {!isOutOfStock && remainingStock > 0 ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-300">Quantity:</span>
                <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2.5 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-bold text-white min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(remainingStock, q + 1))}
                    disabled={quantity >= remainingStock}
                    className="p-2.5 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[11px] text-slate-400">
                  Max: {remainingStock} available
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold border border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 transition-all shadow-md active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-400">
                {isOutOfStock ? "Item is sold out" : "You have added all available stock to your cart"}
              </p>
              <Link
                href="/cart"
                className="inline-block text-xs text-indigo-400 hover:underline font-medium"
              >
                Go to Cart to complete checkout
              </Link>
            </div>
          )}

          {/* Guarantee Badges */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-400" />
              <span>Free Shipping over $100</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-indigo-400" />
              <span>Easy 14-Day Cancellation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
