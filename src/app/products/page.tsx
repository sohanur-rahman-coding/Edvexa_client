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
  ChevronLeft,
  ChevronRight,
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

  // Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 8;

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

  // Reset to page 1 on filter or search modification
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, inStockOnly, sortBy]);

  // Fetch Products whenever filters or page change
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
          page,
          limit,
        };

        const res = await api.products.getAll(params);
        if (isMounted && res?.success && res.data) {
          setProducts(res.data);
          if (res.total !== undefined) setTotal(res.total);
          if (res.totalPages !== undefined) setTotalPages(res.totalPages);
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
  }, [search, selectedCategory, inStockOnly, sortBy, page]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
            <Link href="/" className="hover:text-emerald-700 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-emerald-700 font-bold">Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Equipment & Product Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Browse our full catalog of 20 verified hardware products with real-time inventory synchronization.
          </p>
        </div>

        {/* Live Catalog Metric Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 self-start sm:self-auto shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{total > 0 ? `${total} Total Products` : "20 Products Seeded"}</span>
        </div>
      </div>

      {/* Control Bar: Search, Category Pills & Sort */}
      <section id="catalog-controls" className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description or specs..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters: In Stock & Sorting */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                inStockOnly
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/20"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              In Stock Only
            </button>

            {/* Sort Select */}
            <div className="relative inline-flex items-center">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-8 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer shadow-2xs appearance-none"
              >
                <option value="newest">Sort: Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="stock_asc">Stock: Low to High</option>
                <option value="title_asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
              selectedCategory === "all"
                ? "bg-emerald-600 text-white shadow-emerald-600/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-emerald-600/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200">
                <p className="text-xs text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-800">{(page - 1) * limit + 1}</span> to{" "}
                  <span className="font-bold text-slate-800">{Math.min(page * limit, total)}</span> of{" "}
                  <span className="font-bold text-slate-800">{total}</span> products
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      document.getElementById("catalog-controls")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setPage(num);
                        document.getElementById("catalog-controls")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        page === num
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-extrabold"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-xs"
                      }`}
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setPage((p) => Math.min(totalPages, p + 1));
                      document.getElementById("catalog-controls")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    disabled={page === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
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
