"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, VerticalType } from "@/types/storefront";

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  activeVertical: VerticalType;
  setActiveVertical: (v: VerticalType) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeVertical, setActiveVertical] = useState<VerticalType>("fashion");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ofia_storefront_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("ofia_storefront_cart", JSON.stringify(items));
    } catch {}
  }, [items]);

  const addToCart = (newItem: Omit<CartItem, "id">) => {
    setItems((prev) => {
      // Look for identical variant
      const existingIndex = prev.findIndex(
        (i) =>
          i.productId === newItem.productId &&
          i.selectedColor === newItem.selectedColor &&
          i.selectedSize === newItem.selectedSize &&
          i.selectedPortion === newItem.selectedPortion
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += newItem.quantity || 1;
        return next;
      }

      const generatedId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return [...prev, { ...newItem, id: generatedId }];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        activeVertical,
        setActiveVertical,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
