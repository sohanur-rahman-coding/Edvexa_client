"use client";

/**
 * Sign In Page - Edvexa
 *
 * Supports:
 * - Email + password authentication
 * - 1-click demo login for Admin and Customer roles (for reviewers)
 * - Smart redirect after login (respects ?redirect= query param)
 * - Role-based navigation: admins → /admin, customers → /
 */

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, User, Sparkles, ArrowRight, Lock, Mail } from "lucide-react";

// ─── Inner component that uses useSearchParams ─────────────────────────────

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "";

  const { login, loginAsDemoAdmin, loginAsDemoCustomer, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect them immediately
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const target = isAdmin ? "/admin" : rawRedirect || "/";
      router.replace(target);
    }
  }, [authLoading, isAuthenticated, isAdmin, rawRedirect, router]);

  /**
   * Determine where to send the user after a successful login.
   * Rules:
   *  - Admin users → /admin (unless a more specific admin sub-page was requested)
   *  - Customer users → requested redirect OR homepage (never /admin)
   */
  const resolveRedirectTarget = (loggedInUser) => {
    if (loggedInUser?.role === "admin") {
      // Honour a specific admin sub-page redirect; otherwise go to dashboard
      if (rawRedirect?.startsWith("/admin")) return rawRedirect;
      return "/admin";
    }
    // Customer: never land on /admin
    if (rawRedirect && !rawRedirect.startsWith("/admin") && rawRedirect !== "/signin") {
      return rawRedirect;
    }
    return "/";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res?.success && res.user) {
      const target = resolveRedirectTarget(res.user);
      // window.location.href ensures a full page reload so Next.js middleware
      // picks up the newly-set auth cookie before rendering protected pages.
      window.location.href = target;
    }
  };

  const handleDemoAdmin = async () => {
    setLoading(true);
    const res = await loginAsDemoAdmin();
    setLoading(false);
    if (res?.success && res.user) {
      window.location.href = "/admin";
    }
  };

  const handleDemoCustomer = async () => {
    setLoading(true);
    const res = await loginAsDemoCustomer();
    setLoading(false);
    if (res?.success && res.user) {
      window.location.href = rawRedirect && !rawRedirect.startsWith("/admin") ? rawRedirect : "/";
    }
  };

  // Show nothing while checking existing auth state to avoid flash
  if (authLoading) {
    return (
      <div className="max-w-md mx-auto py-12 text-center text-xs text-slate-500">
        Checking session...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto text-white font-black text-xl shadow-lg shadow-indigo-500/25">
          E
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Sign In to Edvexa</h1>
        <p className="text-xs text-slate-400">
          Access your orders, manage inventory, and oversee fulfillment.
        </p>
      </div>

      {/* Reviewer 1-Click Demo Logins */}
      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3 shadow-lg">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Reviewer Quick Demo Access</span>
        </div>
        <p className="text-[11px] text-slate-300">
          Click below to instantly authenticate without manual typing:
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            id="demo-admin-btn"
            onClick={handleDemoAdmin}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {loading ? "..." : "Admin Demo"}
          </button>
          <button
            type="button"
            id="demo-customer-btn"
            onClick={handleDemoCustomer}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            {loading ? "..." : "Customer Demo"}
          </button>
        </div>
        <p className="text-[10px] text-slate-500 text-center">
          Admin: admin@edvexa.com | Customer: customer@edvexa.com
        </p>
      </div>

      {/* Standard Credentials Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 space-y-4 shadow-xl">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300 block">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              required
              id="email-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300 block">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              required
              id="password-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          id="signin-submit-btn"
          disabled={loading}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Authenticating..." : "Sign In to Account"}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <p className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
          Don't have an account?{" "}
          <Link href="/signup" className="text-indigo-400 hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}

// ─── Page wrapper with Suspense (required because useSearchParams is used) ───

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-12 text-center text-xs text-slate-500">
          Loading sign in...
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
