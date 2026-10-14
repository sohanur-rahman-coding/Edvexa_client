"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on initial render
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem("edvexa_token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);
      try {
        const response = await api.auth.me();
        if (response?.success && response.user) {
          setUser(response.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn("Failed to restore session:", err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem("edvexa_token", res.token);
        setToken(res.token);
        setUser(res.user);
        toast.success(`Welcome back, ${res.user.name}!`);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message };
    } catch (error) {
      toast.error(error.message || "Failed to sign in");
      return { success: false, message: error.message };
    }
  };

  const register = async (name, email, password, role = "customer") => {
    try {
      const res = await api.auth.register({ name, email, password, role });
      if (res.success && res.token) {
        localStorage.setItem("edvexa_token", res.token);
        setToken(res.token);
        setUser(res.user);
        toast.success("Account created successfully!");
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message };
    } catch (error) {
      toast.error(error.message || "Registration failed");
      return { success: false, message: error.message };
    }
  };

  const loginWithGoogle = async (googleProfile) => {
    try {
      const res = await api.auth.google(googleProfile);
      if (res.success && res.token) {
        localStorage.setItem("edvexa_token", res.token);
        setToken(res.token);
        setUser(res.user);
        toast.success(`Signed in with Google as ${res.user.name}`);
        return { success: true, user: res.user };
      }
    } catch (error) {
      toast.error(error.message || "Google sign-in failed");
      return { success: false, message: error.message };
    }
  };

  const loginAsDemoAdmin = async () => {
    return login("admin@edvexa.com", "AdminPassword123!");
  };

  const loginAsDemoCustomer = async () => {
    return login("customer@edvexa.com", "CustomerPassword123!");
  };

  const logout = () => {
    localStorage.removeItem("edvexa_token");
    setToken(null);
    setUser(null);
    toast.success("Signed out successfully");
  };

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
