"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import {
  Search,
  Filter,
  Layers,
  Sparkles,
  Zap,
  ShieldAlert,
  ArrowUpDown,
  RefreshCw,
  Cpu,
  PackageCheck,
} from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter and Search States
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Fetch Categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.products.getCategories();
        if (res?.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.warn("Failed to load categories:", err);
      }
    }
    fetchCategories();
  }, []);

  // Fetch Products whenever filters change
  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      setLoading(true);
      try {
        const params = {
          search: search.trim() || undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          inStock: inStockOnly ? "true" : undefined,
          sortBy,
        };

        const res = await api.products.getAll(params);
        if (isMounted && res?.success && res.data) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const timer = setTimeout(loadProducts, 250); // debounce input
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search, selectedCategory, inStockOnly, sortBy]);

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Showcase Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-950 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>High-Performance Order & Inventory Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Engineered for Precision, Speed, and Zero Overselling.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Edvexa delivers a production-grade e-commerce infrastructure backed by atomic MongoDB concurrency control, strict idempotency against duplicate orders, and automated inventory lifecycle restoration.
          </p>

          {/* Quick Metrics / Architecture Badges */}
          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Atomic MongoDB Operations
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              100% Negative-Stock Prevention
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
              <PackageCheck className="w-3.5 h-3.5 text-purple-400" />
              Full Order Lifecycle Tracker
            </span>
          </div>
        </div>
      </section>

      {/* Filter and Search Control Bar */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by title, category, or specs..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/70 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Controls: In-Stock Toggle & Sort */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* In-Stock Only Toggle */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900/70 cursor-pointer text-xs font-medium text-slate-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-800 h-3.5 w-3.5"
              />
              <span>In-Stock Only</span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/70 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-slate-900 text-white">
                  Newest Additions
                </option>
                <option value="price_asc" className="bg-slate-900 text-white">
                  Price: Low to High
                </option>
                <option value="price_desc" className="bg-slate-900 text-white">
                  Price: High to Low
                </option>
                <option value="stock_asc" className="bg-slate-900 text-white">
                  Stock: Lowest First
                </option>
                <option value="title_asc" className="bg-slate-900 text-white">
                  Name: A to Z
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-slate-900/70 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-slate-900/70 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Product Catalog Grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-square w-full rounded-xl bg-slate-800/60" />
                <div className="h-4 w-3/4 rounded bg-slate-800/80" />
                <div className="h-3 w-1/2 rounded bg-slate-800/50" />
                <div className="h-8 w-full rounded-xl bg-slate-800/60" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-3xl border border-slate-800/80 bg-slate-900/30">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">No products found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              No products match your current search or filter criteria. Try clearing some filters.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setInStockOnly(false);
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
