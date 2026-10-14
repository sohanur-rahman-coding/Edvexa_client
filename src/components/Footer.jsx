import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, Zap, Lock, Package } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-indigo-500/20">
                E
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Edvexa</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-Stack E-Commerce Order & Inventory Management Platform engineered for high concurrency, zero overselling, and idempotent transaction processing.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-indigo-400 transition-colors">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-indigo-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-indigo-400 transition-colors">
                  My Orders & Lifecycle Tracker
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-indigo-400 transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Architecture */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Reliability Standards
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-slate-400">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Atomic MongoDB Concurrency</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Idempotency-Key Deduplication</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>JWT Role-Based Access Control</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Package className="w-3.5 h-3.5 text-indigo-400" />
                <span>Automated Inventory Restoration</span>
              </li>
            </ul>
          </div>

          {/* Contact / Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Candidate Submission
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Software Engineer Intern Assignment submitted to Edvexa Recruitment.
            </p>
            <p className="text-xs text-slate-400">
              Inquiries: <span className="text-indigo-400">career@edvexa.courses</span>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} Edvexa Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Node.js / Express</span>
            <span>•</span>
            <span>Next.js / React</span>
            <span>•</span>
            <span>MongoDB Atlas</span>
          </div>
        </div>
      </div>
    </footer>
  );
}