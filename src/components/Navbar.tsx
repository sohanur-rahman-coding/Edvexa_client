"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  ShieldCheck,
  Package,
  Layers,
  Home,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Zap,
  ArrowRightLeft,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, loginAsDemoAdmin, loginAsDemoCustomer, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll detection for elevated shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQuickRoleSwitch = async (role: "admin" | "customer") => {
    setSwitchingRole(true);
    try {
      if (role === "admin") {
        const res = await loginAsDemoAdmin();
        if (res?.success) {
          router.push("/admin");
        }
      } else {
        const res = await loginAsDemoCustomer();
        if (res?.success) {
          // If on admin route, smoothly navigate to /orders or / to avoid admin route guard
          if (pathname.startsWith("/admin")) {
            router.push("/orders");
          }
        }
      }
    } finally {
      setSwitchingRole(false);
    }
  };

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Products", href: "/products", icon: Layers },
    ...(!isAdmin ? [{ name: "My Orders", href: "/orders", icon: Package }] : []),
    ...(isAdmin ? [{ name: "Admin Dashboard", href: "/admin", icon: ShieldCheck, badge: "Admin" }] : []),
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-emerald-100/80 bg-white/97 backdrop-blur-xl transition-shadow duration-300 ${
        scrolled ? "shadow-md shadow-emerald-500/5" : "shadow-xs"
      }`}
    >
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-1.5 text-xs text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="w-3 h-3 text-emerald-200 animate-pulse flex-shrink-0" />
            <span className="text-white/90 hidden md:inline font-medium text-[11px]">
              Atomic MongoDB Concurrency • Idempotent Orders • Zero Overselling
            </span>
            <span className="text-white/90 md:hidden font-medium text-[11px]">Edvexa Platform</span>
          </div>

          {/* 1-Click Demo Switcher - Allows instant switching between Customer & Admin */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-white/70 hidden sm:inline mr-1">Demo Login:</span>
            <button
              onClick={() => handleQuickRoleSwitch("customer")}
              disabled={switchingRole}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50 ${
                isAuthenticated && !isAdmin
                  ? "bg-white text-emerald-800 shadow-xs border border-white"
                  : "bg-white/15 hover:bg-white/25 text-white border border-white/20"
              }`}
              title="Switch to Demo Customer account"
            >
              <User className="w-3 h-3" />
              Customer 👤
              {isAuthenticated && !isAdmin && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            </button>
            <button
              onClick={() => handleQuickRoleSwitch("admin")}
              disabled={switchingRole}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50 ${
                isAdmin
                  ? "bg-white text-emerald-800 shadow-xs border border-white"
                  : "bg-white/15 hover:bg-white/25 text-white border border-white/20"
              }`}
              title="Switch to Demo Administrator account"
            >
              <ShieldCheck className="w-3 h-3" />
              Admin 👑
              {isAdmin && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-500/25 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-200">
              E
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-slate-900">Edvexa</span>
                <span className="hidden sm:inline text-[9px] tracking-widest uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Platform
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">Order & Inventory</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs"
                      : "text-slate-600 hover:text-emerald-700 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                  {link.name}
                  {link.badge && (
                    <span className="ml-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 transition-all shadow-xs cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-emerald-500/40 animate-bounce-scale">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow-xs">
                    {user?.name ? user.name.charAt(0) : "U"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl p-2 z-50 animate-bounce-scale origin-top-right">
                    <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <span className={`inline-block mt-1.5 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        isAdmin ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {user?.role} Account
                      </span>
                    </div>

                    {!isAdmin ? (
                      <Link
                        href="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-emerald-500" />
                        My Orders
                      </Link>
                    ) : (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => { setUserDropdownOpen(false); logout(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors mt-1 border-t border-slate-100 pt-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/signin"
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-emerald-700 rounded-xl hover:bg-emerald-50/60 border border-slate-200 transition-all cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm shadow-emerald-600/25 transition-all hover:scale-105 cursor-pointer"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-slate-50 border border-slate-200 md:hidden cursor-pointer transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white p-4 md:hidden flex flex-col gap-2 shadow-lg animate-bounce-scale origin-top">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${
                  isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-emerald-600" />
                  {link.name}
                </div>
                {link.badge && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {!isAuthenticated && (
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 mt-1">
              <Link
                href="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-bold text-slate-700 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl cursor-pointer transition-colors"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
