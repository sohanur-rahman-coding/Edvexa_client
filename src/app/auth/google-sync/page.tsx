"use client";

/**
 * Google OAuth Sync Bridge
 *
 * After Google redirects back to /api/auth/callback/google and Better Auth
 * creates a session, the user lands here. This page:
 *   1. Reads the Better Auth session (email, name, image, id)
 *   2. Calls our Express backend POST /api/auth/google to mint our custom JWT
 *   3. Persists the JWT via AuthContext (loginWithGoogle)
 *   4. Signs out of Better Auth (we only need the JWT going forward)
 *   5. Redirects to the target page
 */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/context/AuthContext";
import { Suspense } from "react";

function GoogleSyncContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "";
  const { loginWithGoogle } = useAuth();
  const [status, setStatus] = useState<"syncing" | "error">("syncing");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function sync() {
      try {
        // Read the Better Auth session set during the OAuth callback
        const sessionRes = await authClient.getSession();
        const user = sessionRes?.data?.user;

        if (!user?.email) {
          setStatus("error");
          setErrorMsg("Google did not return a valid session. Please try again.");
          return;
        }

        // Exchange the Google profile for our custom JWT via the Express backend
        const res = await loginWithGoogle({
          email: user.email,
          name: user.name || user.email.split("@")[0],
          image: user.image || null,
          googleId: user.id || user.email,
        });

        // Sign out of Better Auth — our app uses its own JWT from now on
        await authClient.signOut();

        if (res?.success && res.user) {
          const target =
            res.user.role === "admin"
              ? "/admin"
              : rawRedirect && !rawRedirect.startsWith("/admin") && rawRedirect !== "/signin"
              ? rawRedirect
              : "/";
          router.replace(target);
        } else {
          setStatus("error");
          setErrorMsg(res?.message || "Failed to complete sign-in. Please try again.");
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err?.message || "An unexpected error occurred.");
      }
    }

    sync();
  }, []);

  if (status === "error") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-500 text-2xl">✕</div>
          <h1 className="text-xl font-bold text-slate-900">Sign-in failed</h1>
          <p className="text-sm text-slate-500">{errorMsg}</p>
          <button
            onClick={() => router.push("/signin")}
            className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center space-y-5">
        {/* Animated Google colours ring */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#4285F4] border-r-[#34A853] border-b-[#FBBC05] border-l-[#EA4335] animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-800">Completing Google sign-in…</p>
          <p className="text-xs text-slate-400">Setting up your account</p>
        </div>
      </div>
    </div>
  );
}

export default function GoogleSyncPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <GoogleSyncContent />
    </Suspense>
  );
}
