"use client";

/**
 * AuthContext - Edvexa Authentication State Manager (TypeScript)
 *
 * Manages JWT-based authentication:
 * - Stores JWT token and user profile in localStorage for instant retrieval across pages
 * - Sets/clears an `edvexa_auth_presence` cookie
 * - Exposes user, role, and auth helpers to all child components
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { User } from "@/types";
import { toast } from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  register: (name: string, email: string, password: string, role?: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  loginWithGoogle: (googleProfile: any) => Promise<{ success: boolean; user?: User; message?: string }>;
  loginAsDemoAdmin: () => Promise<{ success: boolean; user?: User; message?: string }>;
  loginAsDemoCustomer: () => Promise<{ success: boolean; user?: User; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function setAuthCookie() {
  if (typeof document === "undefined") return;
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isSecure ? "; Secure" : "";
  document.cookie = `edvexa_auth_presence=1; path=/; max-age=2592000; SameSite=Lax${secureFlag}`;
}

function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "edvexa_auth_presence=; path=/; max-age=0; SameSite=Lax";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persistAuth = useCallback((jwtToken: string, userData: User) => {
    localStorage.setItem("edvexa_token", jwtToken);
    localStorage.setItem("edvexa_user", JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    setLoading(false);
    setAuthCookie();
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("edvexa_token");
    localStorage.removeItem("edvexa_user");
    setToken(null);
    setUser(null);
    setLoading(false);
    clearAuthCookie();
  }, []);

  // Restore session from localStorage on mount
  useEffect(() => {
    async function restoreSession() {
      if (typeof window === "undefined") return;

      const storedToken = localStorage.getItem("edvexa_token");
      const storedUser = localStorage.getItem("edvexa_user");

      if (!storedToken) {
        clearAuthCookie();
        setLoading(false);
        return;
      }

      // Immediately restore state from localStorage so the user is never treated as logged out
      setToken(storedToken);
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setLoading(false);
          setAuthCookie();
        } catch (e) {
          console.warn("Failed to parse cached user:", e);
        }
      }

      // Verify token in background with backend
      try {
        const response = await api.auth.me();
        if (response?.success && response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem("edvexa_user", JSON.stringify(response.data.user));
          setAuthCookie();
        } else if (response?.success && (response as any).user) {
          const u = (response as any).user;
          setUser(u);
          localStorage.setItem("edvexa_user", JSON.stringify(u));
          setAuthCookie();
        }
      } catch (err: any) {
        // ONLY clear auth if the server explicitly rejects the token with 401 or 403
        // If it's a transient network timeout or cold start, keep the active session!
        if (err?.status === 401 || err?.status === 403) {
          console.warn("[AuthContext] Token expired or invalid:", err.message);
          clearAuth();
        } else {
          console.warn("[AuthContext] Background token verification delayed, retaining session.");
        }
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, [clearAuth]);

  // Login
  const login = async (email: string, password: string) => {
    try {
      const res = await api.auth.login({ email, password });
      const userData = res.data?.user || (res as any).user;
      const tokenData = res.data?.token || (res as any).token;

      if (res.success && tokenData && userData) {
        persistAuth(tokenData, userData);
        toast.success(`Welcome back, ${userData.name}!`);
        return { success: true, user: userData };
      }
      toast.error(res.message || "Sign-in failed. Please check your credentials.");
      return { success: false, message: res.message };
    } catch (error: any) {
      const message = error.message || "Failed to sign in. Please try again.";
      toast.error(message);
      return { success: false, message };
    }
  };

  // Register
  const register = async (name: string, email: string, password: string, role = "customer") => {
    try {
      const res = await api.auth.register({ name, email, password, role });
      const userData = res.data?.user || (res as any).user;
      const tokenData = res.data?.token || (res as any).token;

      if (res.success && tokenData && userData) {
        persistAuth(tokenData, userData);
        toast.success("Account created successfully! Welcome to Edvexa.");
        return { success: true, user: userData };
      }
      toast.error(res.message || "Registration failed.");
      return { success: false, message: res.message };
    } catch (error: any) {
      const message = error.message || "Registration failed. Please try again.";
      toast.error(message);
      return { success: false, message };
    }
  };

  // Google OAuth
  const loginWithGoogle = async (googleProfile: any) => {
    try {
      const res = await api.auth.google(googleProfile);
      const userData = res.data?.user || (res as any).user;
      const tokenData = res.data?.token || (res as any).token;

      if (res.success && tokenData && userData) {
        persistAuth(tokenData, userData);
        toast.success(`Signed in as ${userData.name}`);
        return { success: true, user: userData };
      }
      return { success: false, message: res.message };
    } catch (error: any) {
      const message = error.message || "Google sign-in failed.";
      toast.error(message);
      return { success: false, message };
    }
  };

  // Reviewer Quick Demo Logins
  const loginAsDemoAdmin = () => login("admin@edvexa.com", "AdminPassword123!");
  const loginAsDemoCustomer = () => login("customer@edvexa.com", "CustomerPassword123!");

  // Logout
  const logout = useCallback(() => {
    clearAuth();
    toast.success("Signed out successfully");
    setTimeout(() => {
      window.location.href = "/";
    }, 250);
  }, [clearAuth]);

  const value: AuthContextType = {
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
