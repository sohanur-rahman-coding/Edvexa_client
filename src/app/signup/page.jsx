"use client";

/**
 * Sign Up Page - Edvexa
 *
 * Allows new users to create an account with their preferred role.
 * After registration, the user is automatically signed in and redirected
 * to the appropriate dashboard (admin or homepage).
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Lock, Mail, User, ShieldCheck, UserCircle } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { register, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(isAdmin ? "/admin" : "/");
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await register(name, email, password, role);
    setLoading(false);

    if (res?.success && res.user) {
      // Full reload so Next.js middleware picks up the new auth cookie
      window.location.href = res.user.role === "admin" ? "/admin" : "/";
    }
  };

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
        <h1 className="text-2xl font-bold text-white tracking-tight">Create an Account</h1>
        <p className="text-xs text-slate-400">
          Join Edvexa to order products and experience our inventory platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 space-y-4 shadow-xl">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300 block">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              required
              id="name-input"
              placeholder="Alex Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Email */}
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

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300 block">Password (min 6 chars)</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              required
              id="password-input"
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300 block">Account Role</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                role === "customer"
                  ? "border-indigo-500 bg-indigo-950/40 text-white shadow-md shadow-indigo-500/10"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              <UserCircle className="w-5 h-5 text-indigo-400" />
              <span>Customer</span>
              <span className="text-[10px] text-slate-500 font-normal">Browse & Order</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                role === "admin"
                  ? "border-indigo-500 bg-indigo-950/40 text-white shadow-md shadow-indigo-500/10"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>Administrator</span>
              <span className="text-[10px] text-slate-500 font-normal">Manage Platform</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          id="signup-submit-btn"
          disabled={loading}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Creating Account..." : "Register Account"}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <p className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
          Already registered?{" "}
          <Link href="/signin" className="text-indigo-400 hover:underline font-semibold">
            Sign in here
          </Link>
        </p>
      </form>
    </div>
  );
}
