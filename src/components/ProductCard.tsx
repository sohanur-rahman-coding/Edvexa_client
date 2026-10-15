"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";
import { toast } from "react-hot-toast";
import {
  ShoppingBag,
  Eye,
  AlertCircle,
  XCircle,
  Plus,
  Check,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, items } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = items.find((i: any) => i.productId === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const remainingStock = Math.max(0, product.stock - qtyInCart);
  const isOutOfStock = product.stock <= 0;
  const isCartStockMaxed = remainingStock === 0 && !isOutOfStock;

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Security check: require login to add items to cart
    if (!isAuthenticated) {
      toast.error("🔒 Please sign in to add products to your cart!", {
        id: "auth-cart-warning",
        duration: 3500,
      });
      router.push("/signin?redirect=/products");
      return;
    }

    if (isOutOfStock) {
      toast.error(`"${product.title}" is sold out.`, { icon: "⚠️" });
      return;
    }
    if (isCartStockMaxed) {
      toast(`All ${product.stock} units are already in your cart!`, { icon: "🛒" });
      return;
    }

    setIsAdding(true);
    const added = addToCart(product, 1);
    if (added) {
      setTimeout(() => {
        setIsAdding(false);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1500);
      }, 350);
    } else {
      setIsAdding(false);
    }
  };

  const stockRatio = Math.min(100, Math.max(0, (product.stock / 20) * 100));

  const stockBadge = isOutOfStock ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-rose-700 border border-rose-200 backdrop-blur-sm shadow-xs">
      <XCircle className="w-3 h-3" /> Sold Out
    </span>
  ) : product.stock <= 5 ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-amber-700 border border-amber-200 backdrop-blur-sm shadow-xs animate-pulse">
      <AlertCircle className="w-3 h-3" /> Only {product.stock} left!
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-emerald-700 border border-emerald-200 backdrop-blur-sm shadow-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
      In Stock ({product.stock})
    </span>
  );

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden">

      {/* Image */}
      <Link
        href={`/products/${product.id}`}
        className="relative aspect-square w-full overflow-hidden bg-slate-100 block cursor-pointer"
      >
        <img
          src={
            imgError || !product.imageUrl
              ? "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80"
              : product.imageUrl
          }
          alt={product.title}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Stock badge */}
        <div className="absolute top-2.5 left-2.5 z-10">{stockBadge}</div>

        {/* Category tag */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-white/95 text-emerald-700 border border-emerald-100 backdrop-blur-sm shadow-xs">
            {product.category}
          </span>
        </div>

        {/* Quick view pill */}
        <div className="absolute inset-x-0 bottom-2.5 flex justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-emerald-800 border border-emerald-200 shadow-md backdrop-blur-sm">
            <Eye className="w-3 h-3 text-emerald-600" /> Quick View
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.id}`} className="group-hover:text-emerald-700 transition-colors cursor-pointer">
          <h3 className="font-bold text-sm text-slate-900 tracking-tight line-clamp-1 mb-1">
            {product.title}
          </h3>
        </Link>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">
          {product.description || "High-performance hardware with guaranteed stock reservation."}
        </p>

        {/* Stock bar */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between items-center text-[10px] text-slate-500">
            <span>Stock</span>
            <span className={product.stock <= 4 ? "text-amber-600 font-bold" : "text-emerald-600 font-semibold"}>
              {product.stock > 0 ? `${product.stock} units` : "0 units"}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                product.stock > 10 ? "bg-emerald-500" : product.stock > 0 ? "bg-amber-400" : "bg-rose-400"
              }`}
              style={{ width: `${Math.max(4, stockRatio)}%` }}
            />
          </div>
        </div>

        {/* Price + Actions */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block -mb-0.5">Price</span>
            <span className="text-base font-extrabold text-slate-900 tracking-tight">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/products/${product.id}`}
              className="p-2 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 transition-all cursor-pointer shadow-xs"
              title="View Details"
            >
              <Eye className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleButtonClick}
              disabled={isAdding}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isOutOfStock
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  : isCartStockMaxed
                  ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                  : justAdded
                  ? "bg-emerald-500 text-white border-emerald-500 scale-95"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 hover:scale-105 active:scale-95 shadow-emerald-600/20"
              }`}
            >
              {justAdded ? (
                <><Check className="w-3.5 h-3.5" /> Added!</>
              ) : isOutOfStock ? (
                "Sold Out"
              ) : isCartStockMaxed ? (
                <><ShoppingBag className="w-3.5 h-3.5" /> In Cart</>
              ) : isAdding ? (
                <><ShoppingBag className="w-3.5 h-3.5 animate-spin" /> Adding...</>
              ) : (
                <><ShoppingBag className="w-3.5 h-3.5" /> Add to Cart</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
