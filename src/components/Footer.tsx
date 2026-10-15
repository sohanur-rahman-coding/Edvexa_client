import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Zap, Lock, Package, CreditCard, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-emerald-500/20 flex-shrink-0">
                <Image src="/Logo.jpg" alt="Edvexa Logo" fill className="object-cover" />
              </div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight">Edvexa</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Full-Stack E-Commerce Order & Inventory Management Platform engineered for high concurrency, zero overselling, and idempotent transactions.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[10px] px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                Stripe Payments
              </span>
              <span className="text-[10px] px-2 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 font-semibold">
                MongoDB ACID
              </span>
              <span className="text-[10px] px-2 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
                JWT Auth
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Navigation</h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { label: "Home Overview", href: "/" },
                { label: "Product Catalog", href: "/products" },
                { label: "Shopping Cart", href: "/cart" },
                { label: "My Orders", href: "/orders" },
                { label: "Admin Dashboard", href: "/admin" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-slate-500 hover:text-emerald-700 transition-colors flex items-center gap-1 group"
                  >
                    {l.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Technical Standards */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Reliability</h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { icon: Zap, label: "Atomic MongoDB Concurrency" },
                { icon: Lock, label: "Idempotency-Key Deduplication" },
                { icon: ShieldCheck, label: "JWT Role-Based Auth" },
                { icon: Package, label: "Auto Inventory Restoration" },
                { icon: CreditCard, label: "Stripe Payment Gateway" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="flex items-center gap-2 text-slate-500">
                    <Icon className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>{item.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Demo Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Demo Access</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              This platform was built for the Edvexa Software Engineer evaluation. Includes 15+ automated integration tests.
            </p>
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="text-[10px] font-bold text-emerald-900 mb-1">Admin Account</p>
                <p className="text-[10px] text-emerald-700 font-mono">admin@edvexa.com</p>
                <p className="text-[10px] text-emerald-700 font-mono">AdminPassword123!</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-700 mb-1">Customer Account</p>
                <p className="text-[10px] text-slate-600 font-mono">customer@edvexa.com</p>
                <p className="text-[10px] text-slate-600 font-mono">CustomerPassword123!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-100 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {year} Edvexa Platform. All rights reserved.</p>
          <div className="flex items-center gap-3 divide-x divide-slate-200">
            <span className="font-medium">Next.js 15</span>
            <span className="pl-3 font-medium">Node.js / Express</span>
            <span className="pl-3 font-medium">MongoDB Atlas</span>
            <span className="pl-3 font-medium">Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
