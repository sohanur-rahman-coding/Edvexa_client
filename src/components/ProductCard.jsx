"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import { ShoppingBag, Eye, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export default function ProductCard({ product }) {
  const { addToCart, items } = useCart();

  // Find if item is already in cart to know how much stock remains for the user
  const cartItem = items.find((i) => i.productId === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const remainingStock = Math.max(0, product.stock - qtyInCart);
  const isOutOfStock = product.stock <= 0;
  const isCartStockMaxed = remainingStock === 0 && !isOutOfStock;

  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error(`"${product.title}" is currently out of stock. Check back soon!`, {
        icon: "⚠️",
      });
      return;
    }
    if (isCartStockMaxed) {
      toast(
        `All available units (${product.stock}) are already in your cart. Visit your cart to complete your order!`,
        { icon: "🛒" }
      );
      return;
    }
    addToCart(product, 1);
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10">
      {/* Product Image Container */}
      <Link href={`/products/${product.id}`} className="relative aspect-square w-full overflow-hidden bg-slate-950 block cursor-pointer">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Live Stock Status Overlay Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {product.stock > 10 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              In Stock ({product.stock})
            </span>
          ) : product.stock > 0 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-md animate-pulse">
              <AlertCircle className="w-3 h-3 text-amber-300" />
              Low Stock: {product.stock} left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-950/80 text-rose-400 border border-rose-500/30 backdrop-blur-md">
              <XCircle className="w-3 h-3 text-rose-400" />
              Out of Stock
            </span>
          )}
        </div>

        {/* Category Tag */}
        <div className="absolute top-3 right-3 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-slate-900/80 text-slate-300 border border-slate-700 backdrop-blur-md">
            {product.category}
          </span>
        </div>
      </Link>

      {/* Product Content */}
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/products/${product.id}`} className="group-hover:text-indigo-400 transition-colors">
          <h3 className="font-semibold text-base text-white tracking-tight line-clamp-1">
            {product.title}
          </h3>
        </Link>

        <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed flex-1">
          {product.description || "High-performance tech gear from Edvexa."}
        </p>

        {/* Price & Action Section */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-400 block -mb-0.5">Price</span>
            <span className="text-lg font-bold text-white tracking-tight">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/products/${product.id}`}
              className="p-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="View Product Details"
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              onClick={handleButtonClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer ${
                isOutOfStock
                  ? "bg-slate-800/60 text-slate-400 border border-slate-800 hover:bg-slate-800"
                  : isCartStockMaxed
                  ? "bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-900/50"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:scale-95"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {isOutOfStock
                ? "Sold Out"
                : isCartStockMaxed
                ? "In Cart (Max)"
                : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
