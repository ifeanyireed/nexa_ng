"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface BuyerAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  isDefault: boolean;
}

export interface BuyerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  addresses: BuyerAddress[];
  membershipTier?: string;
  createdAt: string;
}

interface BuyerAuthContextType {
  buyer: BuyerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: {
    email?: string;
    phone?: string;
    fullName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    phone: string;
    fullName: string;
    city?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<Omit<BuyerProfile, "id" | "addresses" | "createdAt">>) => Promise<boolean>;
  saveAddress: (address: Omit<BuyerAddress, "id"> & { id?: string }) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  setDefaultAddress: (id: string) => Promise<boolean>;
  syncWithOrder: (orderCustomer: {
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    shippingAddress?: string;
    city?: string;
  }) => void;
}

const STORAGE_KEY = "ofia_buyer_profile";
const BuyerAuthContext = createContext<BuyerAuthContextType | undefined>(undefined);

export function BuyerAuthProvider({ children }: { children: React.ReactNode }) {
  const [buyer, setBuyer] = useState<BuyerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load active buyer profile from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.email || parsed.phone)) {
          setBuyer(parsed);
        }
      }
    } catch (e) {
      console.warn("[BuyerAuthContext] Failed to load buyer profile:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save changes to localStorage
  const persistBuyer = useCallback((profile: BuyerProfile | null) => {
    try {
      if (profile) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn("[BuyerAuthContext] Failed to persist buyer profile:", e);
    }
  }, []);

  const login = useCallback(
    async ({
      email,
      phone,
      fullName,
    }: {
      email?: string;
      phone?: string;
      fullName?: string;
    }): Promise<{ success: boolean; error?: string }> => {
      const cleanEmail = (email || "").trim().toLowerCase();
      const cleanPhone = (phone || "").trim();

      if (!cleanEmail && !cleanPhone) {
        return { success: false, error: "Please provide an email or phone number to sign in." };
      }

      // Check existing profile in localStorage or initialize a new one
      let existingProfile: BuyerProfile | null = null;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (
            (cleanEmail && parsed.email?.toLowerCase() === cleanEmail) ||
            (cleanPhone && parsed.phone === cleanPhone)
          ) {
            existingProfile = parsed;
          }
        }
      } catch {}

      const activeProfile: BuyerProfile = existingProfile || {
        id: `buyer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fullName: fullName || (cleanEmail ? cleanEmail.split("@")[0] : "Customer"),
        email: cleanEmail,
        phone: cleanPhone,
        city: "Lagos",
        addresses: [],
        membershipTier: "Patron Member",
        createdAt: new Date().toISOString(),
      };

      setBuyer(activeProfile);
      persistBuyer(activeProfile);
      return { success: true };
    },
    [persistBuyer]
  );

  const register = useCallback(
    async (data: {
      email: string;
      phone: string;
      fullName: string;
      city?: string;
    }): Promise<{ success: boolean; error?: string }> => {
      if (!data.fullName.trim() || (!data.email.trim() && !data.phone.trim())) {
        return { success: false, error: "Full name and email or phone are required." };
      }

      const newProfile: BuyerProfile = {
        id: `buyer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        city: data.city || "Lagos",
        addresses: [],
        membershipTier: "Patron Member",
        createdAt: new Date().toISOString(),
      };

      setBuyer(newProfile);
      persistBuyer(newProfile);
      return { success: true };
    },
    [persistBuyer]
  );

  const logout = useCallback(() => {
    setBuyer(null);
    persistBuyer(null);
  }, [persistBuyer]);

  const updateProfile = useCallback(
    async (updates: Partial<Omit<BuyerProfile, "id" | "addresses" | "createdAt">>): Promise<boolean> => {
      if (!buyer) return false;
      const updated: BuyerProfile = {
        ...buyer,
        ...updates,
      };
      setBuyer(updated);
      persistBuyer(updated);
      return true;
    },
    [buyer, persistBuyer]
  );

  const saveAddress = useCallback(
    async (addr: Omit<BuyerAddress, "id"> & { id?: string }): Promise<boolean> => {
      if (!buyer) return false;
      const id = addr.id || `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const isDefault = addr.isDefault || buyer.addresses.length === 0;

      let nextAddresses: BuyerAddress[];
      const existingIdx = buyer.addresses.findIndex((a) => a.id === id);

      if (existingIdx > -1) {
        nextAddresses = buyer.addresses.map((a) => {
          if (a.id === id) {
            return { ...addr, id, isDefault };
          }
          return isDefault ? { ...a, isDefault: false } : a;
        });
      } else {
        nextAddresses = [
          ...buyer.addresses.map((a) => (isDefault ? { ...a, isDefault: false } : a)),
          { ...addr, id, isDefault },
        ];
      }

      const updatedProfile: BuyerProfile = {
        ...buyer,
        addresses: nextAddresses,
      };

      setBuyer(updatedProfile);
      persistBuyer(updatedProfile);
      return true;
    },
    [buyer, persistBuyer]
  );

  const deleteAddress = useCallback(
    async (id: string): Promise<boolean> => {
      if (!buyer) return false;
      const filtered = buyer.addresses.filter((a) => a.id !== id);
      if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
        filtered[0].isDefault = true;
      }
      const updatedProfile: BuyerProfile = {
        ...buyer,
        addresses: filtered,
      };
      setBuyer(updatedProfile);
      persistBuyer(updatedProfile);
      return true;
    },
    [buyer, persistBuyer]
  );

  const setDefaultAddress = useCallback(
    async (id: string): Promise<boolean> => {
      if (!buyer) return false;
      const updatedAddresses = buyer.addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));
      const updatedProfile: BuyerProfile = {
        ...buyer,
        addresses: updatedAddresses,
      };
      setBuyer(updatedProfile);
      persistBuyer(updatedProfile);
      return true;
    },
    [buyer, persistBuyer]
  );

  const syncWithOrder = useCallback(
    (orderCustomer: {
      customerName: string;
      customerEmail?: string;
      customerPhone: string;
      shippingAddress?: string;
      city?: string;
    }) => {
      const cleanEmail = (orderCustomer.customerEmail || "").trim().toLowerCase();
      const cleanPhone = (orderCustomer.customerPhone || "").trim();
      const cleanName = (orderCustomer.customerName || "").trim();

      if (!cleanName && !cleanEmail && !cleanPhone) return;

      setBuyer((prev) => {
        const base = prev || {
          id: `buyer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          fullName: cleanName || "Customer",
          email: cleanEmail,
          phone: cleanPhone,
          city: orderCustomer.city || "Lagos",
          addresses: [],
          membershipTier: "Patron Member",
          createdAt: new Date().toISOString(),
        };

        // If new shipping address provided, save as default address if none exist
        let addresses = [...base.addresses];
        if (orderCustomer.shippingAddress && orderCustomer.shippingAddress.trim().length > 3) {
          const addrText = orderCustomer.shippingAddress.trim();
          const alreadyExists = addresses.some(
            (a) => a.street.toLowerCase() === addrText.toLowerCase()
          );

          if (!alreadyExists) {
            addresses.push({
              id: `addr_${Date.now()}`,
              label: addresses.length === 0 ? "Primary Residence" : `Delivery Address ${addresses.length + 1}`,
              fullName: cleanName || base.fullName,
              phone: cleanPhone || base.phone,
              street: addrText,
              city: orderCustomer.city || base.city || "Lagos",
              state: "Lagos State",
              isDefault: addresses.length === 0,
            });
          }
        }

        const updated: BuyerProfile = {
          ...base,
          fullName: cleanName || base.fullName,
          email: cleanEmail || base.email,
          phone: cleanPhone || base.phone,
          city: orderCustomer.city || base.city,
          addresses,
        };

        persistBuyer(updated);
        return updated;
      });
    },
    [persistBuyer]
  );

  return (
    <BuyerAuthContext.Provider
      value={{
        buyer,
        isAuthenticated: Boolean(buyer && (buyer.email || buyer.phone)),
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        saveAddress,
        deleteAddress,
        setDefaultAddress,
        syncWithOrder,
      }}
    >
      {children}
    </BuyerAuthContext.Provider>
  );
}

export function useBuyerAuth() {
  const context = useContext(BuyerAuthContext);
  if (!context) {
    throw new Error("useBuyerAuth must be used within a BuyerAuthProvider");
  }
  return context;
}
