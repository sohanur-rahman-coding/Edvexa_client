"use client";

/**
 * AuthContext - Edvexa Authentication State Manager
 *
 * Manages JWT-based authentication:
 * - Stores JWT token in localStorage for API requests
 * - Sets/clears an `edvexa_auth_presence` cookie so Next.js middleware
 *   can protect server-side routes (middleware cannot read localStorage)
 * - Exposes user, role, and auth helpers to all child components
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

const AuthContext = createContext(null);

// ─── Cookie helpers ─────────────────────────────────────────────────────────
// These are lightweight cookie utilities since we only need a simple presence flag.

function setAuthCookie() {
  // Max-age = 7 days (matches JWT expiry). Path=/ so middleware can read it anywhere.
  document.cookie = "edvexa_auth_presence=1; path=/; max-age=604800; SameSite=Lax";
}

function clearAuthCookie() {
  document.cookie = "edvexa_auth_presence=; path=/; max-age=0; SameSite=Lax";
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Internal: persist auth state ──────────────────────────────────────────
  const persistAuth = useCallback((jwtToken, userData) => {
    localStorage.setItem("edvexa_token", jwtToken);
    setToken(jwtToken);
    setUser(userData);
    setAuthCookie(); // Signal to Next.js middleware that user is logged in
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("edvexa_token");
    setToken(null);
    setUser(null);
    clearAuthCookie(); // Remove middleware cookie
  }, []);

  // ── Restore session from localStorage on mount ─────────────────────────────
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem("edvexa_token");

      if (!storedToken) {
        clearAuthCookie(); // Ensure cookie is also cleared if no token
        setLoading(false);
        return;
      }

      setToken(storedToken);
      try {
        const response = await api.auth.me();
        if (response?.success && response.user) {
          setUser(response.user);
          setAuthCookie(); // Refresh cookie on each session restore
        } else {
          // Invalid/expired token — clear everything
          clearAuth();
        }
      } catch (err) {
        console.warn("[AuthContext] Failed to restore session:", err.message);
        clearAuth();
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.token) {
        persistAuth(res.token, res.user);
        toast.success(`Welcome back, ${res.user.name}!`);
        return { success: true, user: res.user };
      }
      toast.error(res.message || "Sign-in failed. Please check your credentials.");
      return { success: false, message: res.message };
    } catch (error) {
      const message = error.message || "Failed to sign in. Please try again.";
      toast.error(message);
      return { success: false, message };
    }
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const register = async (name, email, password, role = "customer") => {
    try {
      const res = await api.auth.register({ name, email, password, role });
      if (res.success && res.token) {
        persistAuth(res.token, res.user);
        toast.success("Account created successfully! Welcome to Edvexa.");
        return { success: true, user: res.user };
      }
      toast.error(res.message || "Registration failed.");
      return { success: false, message: res.message };
    } catch (error) {
      const message = error.message || "Registration failed. Please try again.";
      toast.error(message);
      return { success: false, message };
    }
  };

  // ── Google OAuth ───────────────────────────────────────────────────────────
  const loginWithGoogle = async (googleProfile) => {
    try {
      const res = await api.auth.google(googleProfile);
      if (res.success && res.token) {
        persistAuth(res.token, res.user);
        toast.success(`Signed in with Google as ${res.user.name}`);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message };
    } catch (error) {
      const message = error.message || "Google sign-in failed.";
      toast.error(message);
      return { success: false, message };
    }
  };

  // ── Demo login shortcuts (for reviewers) ───────────────────────────────────
  const loginAsDemoAdmin = () => login("admin@edvexa.com", "AdminPassword123!");
  const loginAsDemoCustomer = () => login("customer@edvexa.com", "CustomerPassword123!");

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearAuth();
    toast.success("Signed out successfully");
    // Use a short delay so the toast renders before navigation
    setTimeout(() => {
      window.location.href = "/";
    }, 300);
  }, [clearAuth]);

  // ── Context value ──────────────────────────────────────────────────────────
  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isCustomer: user?.role === "customer",
    login,
    register,
    loginWithGoogle,
    loginAsDemoAdmin,
    loginAsDemoCustomer,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
