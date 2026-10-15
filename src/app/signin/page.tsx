"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authClient } from "@/lib/auth-client";
import GoogleIcon from "@/components/GoogleIcon";
import {
  ShieldCheck,
  User,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "";

  const { login, loginAsDemoAdmin, loginAsDemoCustomer, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(isAdmin ? "/admin" : rawRedirect || "/");
    }
  }, [authLoading, isAuthenticated, isAdmin, rawRedirect, router]);

  const resolveTarget = (loggedInUser: any) => {
    if (loggedInUser?.role === "admin") return rawRedirect?.startsWith("/admin") ? rawRedirect : "/admin";
    if (rawRedirect && !rawRedirect.startsWith("/admin") && rawRedirect !== "/signin") return rawRedirect;
    return "/";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res?.success && res.user) router.push(resolveTarget(res.user));
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    // Build the callbackURL so google-sync can redirect back after JWT is minted
    const callbackURL =
      rawRedirect && !rawRedirect.startsWith("/admin") && rawRedirect !== "/signin"
        ? `/auth/google-sync?redirect=${encodeURIComponent(rawRedirect)}`
        : "/auth/google-sync";
    // This redirects the browser to Google — loading spinner stays until navigation
    await authClient.signIn.social({ provider: "google", callbackURL });
    // If for some reason we land back here (e.g. popup blocked), reset spinner
    setGoogleLoading(false);
  };

  const handleDemoAdmin = async () => {
    setLoading(true);
    const res = await loginAsDemoAdmin();
    setLoading(false);
    if (res?.success) router.push("/admin");
  };

  const handleDemoCustomer = async () => {
    setLoading(true);
    const res = await loginAsDemoCustomer();
    setLoading(false);
    if (res?.success) router.push(rawRedirect && !rawRedirect.startsWith("/admin") ? rawRedirect : "/");
  };

  if (authLoading) {
    return <div className="max-w-md mx-auto py-20 text-center text-sm text-slate-400">Checking session...</div>;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 animate-bounce-scale">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 flex items-center justify-center mx-auto text-white font-black text-2xl shadow-lg shadow-emerald-500/25">
            E
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back</h1>
          <p className="text-sm text-slate-500">Sign in to your Edvexa account</p>
        </div>

        {/* Continue with Google */}
        <button
          type="button"
          id="continue-with-google-btn"
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/90 text-slate-700 text-sm font-semibold shadow-xs hover:shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {googleLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              Connecting with Google...
            </span>
          ) : (
            <>
              <GoogleIcon className="w-5 h-5 flex-shrink-0" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Demo Quick Access */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-200 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Reviewer Quick Access
          </div>
          <p className="text-[11px] text-slate-600 mb-3">Skip typing — use these demo accounts instantly:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="demo-admin-btn"
              onClick={handleDemoAdmin}
              disabled={loading || googleLoading}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
              Admin Demo 👑
            </button>
            <button
              type="button"
              id="demo-customer-btn"
              onClick={handleDemoCustomer}
              disabled={loading || googleLoading}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-200 hover:border-emerald-300 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              Customer Demo 👤
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">or sign in with email</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-7 shadow-md space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                id="email-input"
                placeholder="admin@edvexa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showPass ? "text" : "password"}
                required
                id="password-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="submit-signin-btn"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <>Sign In <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-emerald-700 hover:text-emerald-800 font-bold underline underline-offset-2">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-sm text-slate-400">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
