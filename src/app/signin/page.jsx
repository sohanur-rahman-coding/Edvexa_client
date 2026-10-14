"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, User, Sparkles, ArrowRight, Lock, Mail } from "lucide-react";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const { login, loginAsDemoAdmin, loginAsDemoCustomer } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res?.success) {
      router.push(redirectPath);
    }
  };

  const handleDemoAdmin = async () => {
    setLoading(true);
    const res = await loginAsDemoAdmin();
    setLoading(false);
    if (res?.success) {
      router.push("/admin");
    }
  };

  const handleDemoCustomer = async () => {
    setLoading(true);
    const res = await loginAsDemoCustomer();
    setLoading(false);
    if (res?.success) {
      router.push(redirectPath);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
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
            onClick={handleDemoAdmin}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Demo
          </button>
          <button
            type="button"
            onClick={handleDemoCustomer}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
          >
            <User className="w-3.5 h-3.5" />
            Customer Demo
          </button>
        </div>
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
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50"
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

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto py-12 text-center text-xs text-slate-500">Loading sign in...</div>}>
      <SignInContent />
    </Suspense>
  );
}
