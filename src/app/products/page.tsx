"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import {
  Search,
  Filter,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";

export default function ProductsCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
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
        const params: Record<string, string | number | boolean | undefined> = {
          search: search.trim() || undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          inStock: inStockOnly ? "true" : undefined,
          sortBy,
          limit: 50,
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

    const timer = setTimeout(loadProducts, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search, selectedCategory, inStockOnly, sortBy]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Breadcrumb & Title */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
          <Link href="/" className="hover:text-emerald-700 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-emerald-700 font-bold">Product Catalog</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              All Products & Hardware
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xl font-medium">
              Browse our inventory with real-time stock tracking and atomic reservation protection.
            </p>
          </div>
          <div className="text-xs text-slate-700 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl self-start md:self-auto font-medium shadow-xs">
            Showing <strong className="text-emerald-700">{products.length}</strong> items
          </div>
        </div>
      </div>

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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer px-1.5 py-0.5 rounded bg-slate-100"
              >
                Clear
              </button>
            )}
          </div>

          {/* Controls: In-Stock Toggle & Sort */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* In-Stock Only Toggle */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white cursor-pointer text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors select-none shadow-xs">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 bg-white h-3.5 w-3.5 cursor-pointer"
              />
              <span>In-Stock Only</span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest Additions</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="stock_asc">Stock: Lowest First</option>
                <option value="title_asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200"
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
                className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4 animate-pulse shadow-xs"
              >
                <div className="aspect-square w-full rounded-xl bg-slate-100" />
                <div className="h-4 w-3/4 rounded bg-slate-100" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
                <div className="h-8 w-full rounded-xl bg-slate-100" />
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
          <div className="text-center py-20 px-4 rounded-3xl border border-slate-200 bg-white shadow-xs">
            <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No products match your criteria</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto font-medium">
              Try adjusting your search terms or reset the filters to see all available inventory.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setInStockOnly(false);
                setSortBy("newest");
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
