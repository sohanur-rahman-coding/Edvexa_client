"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Restore cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("edvexa_cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to parse cart storage:", e);
    }
    setMounted(true);
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("edvexa_cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  const addToCart = (product, quantity = 1) => {
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

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          if (newQty > item.maxStock) {
            toast.error(
              `Maximum available stock reached (${item.maxStock} units).`
            );
            return { ...item, quantity: item.maxStock };
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
    toast.success("Item removed from cart");
  };

  const clearCart = () => {
    setItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("edvexa_cart");
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value = {
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
