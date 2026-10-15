"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

interface CartContextItem extends CartItem {
  maxStock?: number;
}

interface CartContextType {
  items: CartContextItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (product: Product, quantity?: number) => boolean;
  updateQuantity: (productId: string, newQty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState<CartContextItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // User-scoped storage key prevents cart leaks across unauthenticated or different users
  const storageKey = user?.id ? `edvexa_cart_${user.id}` : null;

  // Sync cart when authentication state or active user changes
  useEffect(() => {
    if (!isAuthenticated || !storageKey) {
      // Clear memory cart when unauthenticated
      setItems([]);
      setMounted(true);
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        setItems([]);
      }
    } catch (e) {
      console.warn("Failed to load user cart:", e);
      setItems([]);
    }
    setMounted(true);
  }, [isAuthenticated, storageKey]);

  // Save cart to user-scoped storage whenever items change
  useEffect(() => {
    if (mounted && isAuthenticated && storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, mounted, isAuthenticated, storageKey]);

  const addToCart = (product: Product, quantity = 1): boolean => {
    // Security Guard: Prevent unauthenticated users from adding to cart
    if (!isAuthenticated || !user) {
      toast.error("🔒 Please sign in to add products to your cart!", {
        id: "auth-cart-warning",
        duration: 4000,
      });
      return false;
    }

    if (!product || product.stock <= 0) {
      toast.error("This product is currently out of stock.");
      return false;
    }

    const availableStock = product.stock;
    const existingIndex = items.findIndex((i) => i.productId === product.id);

    if (existingIndex > -1) {
      const currentQty = items[existingIndex].quantity;
      const desiredQty = currentQty + quantity;

      if (desiredQty > availableStock) {
        toast.error(
          `Cannot add more! Only ${availableStock} units available in stock.`
        );
        return false;
      }

      const updated = [...items];
      updated[existingIndex].quantity = desiredQty;
      updated[existingIndex].maxStock = availableStock;
      setItems(updated);
      toast.success(`Updated "${product.title}" quantity to ${desiredQty}`);
    } else {
      if (quantity > availableStock) {
        toast.error(
          `Cannot add ${quantity} units! Only ${availableStock} available.`
        );
        return false;
      }

      setItems((prev) => [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category,
          quantity,
          maxStock: availableStock,
        },
      ]);
      toast.success(`Added "${product.title}" to cart!`);
    }

    return true;
  };

  const updateQuantity = (productId: string, newQty: number) => {
    if (!isAuthenticated || !user) {
      toast.error("🔒 Sign in required to modify your cart.");
      return;
    }

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const max = item.maxStock !== undefined ? item.maxStock : 999;
          if (newQty > max) {
            toast.error(
              `Maximum available stock reached (${max} units).`
            );
            return { ...item, quantity: max };
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    if (!isAuthenticated || !user) return;
    setItems((prev) => prev.filter((item) => item.productId !== productId));
    toast.success("Item removed from cart");
  };

  const clearCart = () => {
    setItems([]);
    if (typeof window !== "undefined" && storageKey) {
      localStorage.removeItem(storageKey);
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value: CartContextType = {
    items,
    itemCount,
    subtotal: Math.round(subtotal * 100) / 100,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
