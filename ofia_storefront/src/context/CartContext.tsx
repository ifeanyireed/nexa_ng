"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { CartItem, VerticalType } from "@/types/storefront";
import { useStorefrontTenant } from "@/context/StorefrontTenantContext";
import { useBuyerAuth } from "@/context/BuyerAuthContext";

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
  isSyncingCart: boolean;
}

const SESSION_STORAGE_KEY = "ofia_cart_session_id";
const CartContext = createContext<CartContextType | undefined>(undefined);

function getOrCreateCartSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let existing = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!existing) {
      existing = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(SESSION_STORAGE_KEY, existing);
    }
    return existing;
  } catch {
    return `sess_${Date.now()}`;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { tenantSlug } = useStorefrontTenant();
  const { buyer } = useBuyerAuth();

  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeVertical, setActiveVertical] = useState<VerticalType>("fashion");
  const [isSyncingCart, setIsSyncingCart] = useState(false);
  const sessionIdRef = useRef<string>("");

  const scopedLocalKey = `ofia_storefront_cart_${(tenantSlug || "default").toLowerCase().trim()}`;

  // Push cart state to dedicated tenant database
  const syncCartToDatabase = useCallback(
    async (nextItems: CartItem[]) => {
      const cleanTenant = (tenantSlug || "").toLowerCase().trim();
      const sessionId = sessionIdRef.current || getOrCreateCartSessionId();

      // Mirror to tenant-scoped localStorage cache for instant reload resilience
      try {
        localStorage.setItem(scopedLocalKey, JSON.stringify(nextItems));
        // Clear legacy unscoped cart key so stale items never bleed in
        localStorage.removeItem("ofia_storefront_cart");
      } catch {}

      if (!cleanTenant) return;

      setIsSyncingCart(true);
      try {
        if (nextItems.length === 0) {
          const params = new URLSearchParams({ tenant: cleanTenant });
          if (buyer?.id) params.set("buyerId", buyer.id);
          if (buyer?.email) params.set("buyerEmail", buyer.email);
          if (sessionId) params.set("sessionId", sessionId);

          await fetch(`/api/storefront/cart?${params.toString()}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenantSlug: cleanTenant,
              buyerId: buyer?.id || "",
              buyerEmail: buyer?.email || "",
              sessionId,
            }),
          });
        } else {
          await fetch("/api/storefront/cart", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenantSlug: cleanTenant,
              buyerId: buyer?.id || "",
              buyerEmail: buyer?.email || "",
              sessionId,
              items: nextItems,
            }),
          });
        }
      } catch (err) {
        console.warn("[CartContext] Database cart sync warning:", err);
      } finally {
        setIsSyncingCart(false);
      }
    },
    [tenantSlug, buyer?.id, buyer?.email, scopedLocalKey]
  );

  // Hydrate cart from tenant's dedicated Neon PostgreSQL database (and merge guest session cart on login)
  useEffect(() => {
    sessionIdRef.current = getOrCreateCartSessionId();
    const cleanTenant = (tenantSlug || "").toLowerCase().trim();

    // Remove legacy global unscoped key
    try {
      localStorage.removeItem("ofia_storefront_cart");
    } catch {}

    // 1. Load initial tenant-scoped cache
    let localCached: CartItem[] = [];
    try {
      const saved = localStorage.getItem(scopedLocalKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          localCached = parsed;
          setItems(parsed);
        }
      } else {
        setItems([]);
      }
    } catch {}

    if (!cleanTenant) return;

    // 2. Fetch authoritative cart from dedicated tenant DB
    let cancelled = false;
    async function loadFromDb() {
      setIsSyncingCart(true);
      try {
        const params = new URLSearchParams({ tenant: cleanTenant });
        if (buyer?.id) params.set("buyerId", buyer.id);
        if (buyer?.email) params.set("buyerEmail", buyer.email);
        if (sessionIdRef.current) params.set("sessionId", sessionIdRef.current);

        const res = await fetch(`/api/storefront/cart?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => null);
        if (cancelled) return;

        if (res.ok && data?.success && Array.isArray(data.items)) {
          if (data.items.length > 0) {
            setItems(data.items);
            try {
              localStorage.setItem(scopedLocalKey, JSON.stringify(data.items));
            } catch {}
          } else if (localCached.length > 0) {
            // If DB cart is empty but local tenant cart has items, push them to DB
            await fetch("/api/storefront/cart", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tenantSlug: cleanTenant,
                buyerId: buyer?.id || "",
                buyerEmail: buyer?.email || "",
                sessionId: sessionIdRef.current,
                items: localCached,
              }),
            });
          } else {
            setItems([]);
          }
        }
      } catch (err) {
        console.warn("[CartContext] Failed to fetch DB cart:", err);
      } finally {
        if (!cancelled) setIsSyncingCart(false);
      }
    }

    loadFromDb();
    return () => {
      cancelled = true;
    };
  }, [tenantSlug, buyer?.id, buyer?.email, scopedLocalKey]);

  const addToCart = (newItem: Omit<CartItem, "id">) => {
    setItems((prev) => {
      const getAccKey = (item: any) =>
        (item.selectedAccessories || [])
          .map((a: any) => a.id || a.name)
          .sort()
          .join(",");

      const getBespokeKey = (item: any) =>
        item.bespokeMeasurements ? JSON.stringify(item.bespokeMeasurements) : "";

      const existingIndex = prev.findIndex(
        (i) =>
          i.productId === newItem.productId &&
          (newItem.sku ? i.sku === newItem.sku : true) &&
          i.selectedColor === newItem.selectedColor &&
          i.selectedSize === newItem.selectedSize &&
          i.selectedPrint === newItem.selectedPrint &&
          i.selectedPortion === newItem.selectedPortion &&
          getAccKey(i) === getAccKey(newItem) &&
          getBespokeKey(i) === getBespokeKey(newItem)
      );

      let next: CartItem[];
      if (existingIndex > -1) {
        next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + (newItem.quantity || 1),
        };
      } else {
        const generatedId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        next = [...prev, { ...newItem, id: generatedId }];
      }

      syncCartToDatabase(next);
      return next;
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      syncCartToDatabase(next);
      return next;
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) => {
      const next = prev
        .map((i) => {
          if (i.id === id) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
      syncCartToDatabase(next);
      return next;
    });
  };

  const clearCart = () => {
    setItems([]);
    syncCartToDatabase([]);
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
        isSyncingCart,
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
