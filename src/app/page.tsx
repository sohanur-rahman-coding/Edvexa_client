"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  Layers,
  Zap,
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
  Cpu,
  ArrowRight,
  Lock,
  RotateCcw,
  TrendingUp,
  Package,
  Star,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.products.getCategories();
        if (res?.success && res.data) setCategories(res.data);
      } catch (err) {
        console.warn("Failed to load categories:", err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      setLoading(true);
      try {
        const params: Record<string, string | number | boolean | undefined> = {
          search: search.trim() || undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          inStock: inStockOnly ? "true" : undefined,
          sortBy,
          limit: 50,
        };
        const res = await api.products.getAll(params);
        if (isMounted && res?.success && res.data) setProducts(res.data);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    const timer = setTimeout(loadProducts, 250);
    return () => { isMounted = false; clearTimeout(timer); };
  }, [search, selectedCategory, inStockOnly, sortBy]);

  const features = [
    {
      icon: Cpu,
      title: "Atomic Concurrency",
      desc: "Zero TOCTOU race conditions via atomic $inc and $gte stock filters inside multi-document ACID transactions.",
      color: "emerald",
    },
    {
      icon: Lock,
      title: "Idempotency Layer",
      desc: "Cryptographic client-generated headers cache completed checkouts, preventing double-deductions automatically.",
      color: "teal",
    },
    {
      icon: RotateCcw,
      title: "Auto Stock Rollback",
      desc: "Pending → Confirmed → Shipped → Delivered. Cancelled orders atomically restore reserved inventory.",
      color: "green",
    },
  ];

  return (
    <div className="space-y-14 pb-20 page-enter">

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 p-8 sm:p-14 shadow-sm">
        {/* Ambient Blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-teal-200/20 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-emerald-100/20 blur-[80px]" />

        <div className="relative max-w-5xl space-y-7">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm animate-bounce-scale">
            <Zap className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>High-Performance Order &amp; Inventory Engine</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
            Built for Precision,{" "}
            <span className="block">Speed &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500">Zero Overselling.</span></span>
          </h1>

          <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
            Edvexa delivers production-grade e-commerce infrastructure backed by{" "}
            <span className="font-semibold text-slate-800">atomic MongoDB</span> conditional operations,{" "}
            <span className="font-semibold text-slate-800">strict idempotency</span> against duplicate orders, and{" "}
            <span className="font-semibold text-slate-800">automated inventory lifecycle</span> restoration.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/products"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Explore Products
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-emerald-50/80 text-emerald-900 border border-emerald-200 hover:border-emerald-300 text-sm font-bold transition-all shadow-sm cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Admin Portal
            </Link>
          </div>

          {/* Architecture Feature Badges */}
          <div className="pt-3 flex flex-wrap gap-2 border-t border-emerald-200/60">
            {[
              { icon: Cpu, label: "Atomic MongoDB", color: "text-emerald-600" },
              { icon: ShieldAlert, label: "Negative-Stock Prevention", color: "text-teal-600" },
              { icon: Lock, label: "Idempotent Retries", color: "text-amber-600" },
              { icon: RotateCcw, label: "Auto Stock Restoration", color: "text-purple-600" },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <span
                  key={badge.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-slate-200/80 text-slate-700 text-xs font-semibold shadow-sm hover:border-emerald-200 transition-colors"
                >
                  <Icon className={`w-3.5 h-3.5 ${badge.color}`} />
                  {badge.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Floating Stats — right side on large screens */}
        <div className="hidden xl:flex absolute right-14 top-1/2 -translate-y-1/2 flex-col gap-3">
          {[
            { icon: TrendingUp, val: "100%", label: "Uptime SLA", color: "emerald" },
            { icon: Package, val: "0ms", label: "Oversell Risk", color: "teal" },
            { icon: Star, val: "ACID", label: "Transactions", color: "green" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-${s.color}-200 shadow-sm hover:shadow-md transition-shadow`}>
                <div className={`w-8 h-8 rounded-xl bg-${s.color}-50 border border-${s.color}-200 flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 text-${s.color}-600`} />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900 leading-none">{s.val}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Feature Cards ─── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {features.map((f, i) => {
          const Icon = f.icon;
          const colors: Record<string, string> = {
            emerald: "bg-emerald-50 border-emerald-200 text-emerald-600",
            teal:    "bg-teal-50 border-teal-200 text-teal-600",
            green:   "bg-green-50 border-green-200 text-green-600",
          };
          return (
            <div
              key={f.title}
              className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all space-y-4 cursor-default"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${colors[f.color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Production-grade
              </div>
            </div>
          );
        })}
      </section>

      {/* ─── Product Catalog Section ─── */}
      <section className="space-y-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-emerald-600" />
              Featured Inventory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Live stock sync across all sessions</p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition-colors bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200"
          >
            View Full Catalog ({products.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Search & Filters Row */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-200 transition-all select-none shadow-sm">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
              />
              In Stock Only
            </label>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-sm">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="stock_asc">Stock: Lowest First</option>
                <option value="title_asc">Name: A → Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["all", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
                <div className="aspect-square w-full rounded-xl skeleton" />
                <div className="h-4 w-3/4 skeleton" />
                <div className="h-3 w-1/2 skeleton" />
                <div className="h-9 w-full rounded-xl skeleton" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No products found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={() => { setSearch(""); setSelectedCategory("all"); setInStockOnly(false); }}
              className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
