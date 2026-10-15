"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
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
  Lock,
  Zap,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { addToCart, items } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await api.products.getById(id);
        if (res?.success && res.data) {
          setProduct(res.data);
        } else {
          setError("Product not found");
        }
      } catch (err: any) {
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
        <div className="h-6 w-32 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-slate-200 rounded-xl" />
            <div className="h-6 w-1/4 bg-slate-200 rounded-xl" />
            <div className="h-24 w-full bg-slate-200 rounded-2xl" />
            <div className="h-12 w-full bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-sm text-slate-500">{error || "The requested product does not exist."}</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const cartItem = items.find((i: any) => i.productId === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const remainingStock = Math.max(0, product.stock - qtyInCart);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("🔒 Please sign in to add products to your cart!", {
        id: "auth-cart-warning",
        duration: 3500,
      });
      router.push(`/signin?redirect=/products/${id}`);
      return;
    }
    if (isOutOfStock) {
      toast.error("This product is currently out of stock.");
      return;
    }
    if (quantity > remainingStock) {
      toast.error(`Only ${remainingStock} more units available to add.`);
      return;
    }
    const success = addToCart(product, quantity);
    if (success) {
      setQuantity(1);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error("🔒 Please sign in to checkout!", {
        id: "auth-cart-warning",
        duration: 3500,
      });
      router.push(`/signin?redirect=/products/${id}`);
      return;
    }
    if (isOutOfStock) {
      toast.error("This product is currently out of stock.");
      return;
    }
    if (quantity > remainingStock) {
      toast.error(`Only ${remainingStock} more units available to add.`);
      return;
    }
    const success = addToCart(product, quantity);
    if (success) {
      router.push("/cart");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 pb-16">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-emerald-700 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-emerald-700 transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-emerald-700 font-bold truncate max-w-xs">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Product Image */}
        <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-md">
          <img
            src={
              imgError || !product.imageUrl
                ? "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80"
                : product.imageUrl
            }
            alt={product.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center"
          />

          {/* Category Badge */}
          <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 text-emerald-800 border border-emerald-200 backdrop-blur-md shadow-xs">
            {product.category}
          </span>
        </div>

        {/* Product Information & Purchase Panel */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {product.title}
            </h1>

            {/* Live Stock Indicator */}
            <div className="pt-1">
              {product.stock > 10 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  In Stock ({product.stock} units available)
                </span>
              ) : product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Low Stock Warning: Only {product.stock} units remain!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Currently Out of Stock
                </span>
              )}
            </div>

            {/* Price Display */}
            <div className="pt-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="text-xs text-slate-500 ml-2 font-medium">USD (Taxes calculated at checkout)</span>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Product Overview
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {product.description || "Premium hardware engineered for developers and creators."}
            </p>
          </div>

          {/* Quantity Controls & Purchase Buttons */}
          <div className="space-y-4 pt-2">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700">Quantity:</span>
                <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-1.5 text-sm font-bold text-slate-900 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(remainingStock, q + 1))}
                    disabled={quantity >= remainingStock}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {qtyInCart > 0 && (
                  <span className="text-xs text-emerald-700 font-semibold">
                    ({qtyInCart} already in your cart)
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || remainingStock === 0}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                {isOutOfStock
                  ? "Sold Out"
                  : remainingStock === 0
                  ? "Max Stock in Cart"
                  : "Add to Cart"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock || remainingStock === 0}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-white hover:bg-emerald-50/60 text-emerald-900 border border-emerald-300 hover:border-emerald-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                <Zap className="w-4 h-4 text-emerald-600" />
                Instant Checkout
              </button>
            </div>
          </div>

          {/* Guarantees Box */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Overselling</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Atomic MongoDB reservation guarantees your stock.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Fast Dispatch</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Fulfillment workflow tracking from Confirmed to Delivered.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
