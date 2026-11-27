"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { User, X, Lock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { useStorefrontTenant } from "@/context/StorefrontTenantContext";

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

export interface BespokeMeasurements {
  chest: string;
  waist: string;
  hips: string;
  shoulder: string;
  sleeveLength: string;
  garmentLength: string;
  neck?: string;
  notes?: string;
  unit?: "in" | "cm";
}

export interface BuyerMeasurementPreset {
  id: string;
  name: string;
  measurements: BespokeMeasurements;
  preferredPrint?: string;
  preferredColor?: string;
  createdAt: string;
}

export interface BuyerSavedProduct {
  productId: string;
  title: string;
  price: number;
  image: string;
  vertical: string;
  storeSlug?: string;
  selectedPrint?: string;
  selectedColor?: string;
  selectedSize?: string;
  savedAt: string;
}

export interface BuyerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  addresses: BuyerAddress[];
  measurementPresets?: BuyerMeasurementPreset[];
  savedProducts?: BuyerSavedProduct[];
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
  saveMeasurementPreset: (
    preset: Omit<BuyerMeasurementPreset, "id" | "createdAt"> & { id?: string }
  ) => Promise<BuyerMeasurementPreset | null>;
  deleteMeasurementPreset: (id: string) => Promise<boolean>;
  toggleSaveProduct: (product: Omit<BuyerSavedProduct, "savedAt">) => Promise<{ saved: boolean }>;
  isProductSaved: (productId: string) => boolean;
  requireAuthModal: (reason: string, onSuccess?: () => void) => void;
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
  const { tenantSlug } = useStorefrontTenant();
  const [buyer, setBuyer] = useState<BuyerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Global Storefront Auth Prompt Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [modalFullName, setModalFullName] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalCity, setModalCity] = useState("Lagos");
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);
  const pendingCallbackRef = useRef<(() => void) | undefined>(undefined);

  // Load active buyer profile from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.email || parsed.phone)) {
          setBuyer({
            ...parsed,
            addresses: Array.isArray(parsed.addresses) ? parsed.addresses : [],
            measurementPresets: Array.isArray(parsed.measurementPresets) ? parsed.measurementPresets : [],
            savedProducts: Array.isArray(parsed.savedProducts) ? parsed.savedProducts : [],
          });
        }
      }
    } catch (e) {
      console.warn("[BuyerAuthContext] Failed to load buyer profile:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save changes to localStorage & sync with dedicated tenant PostgreSQL database
  const persistBuyer = useCallback(
    (profile: BuyerProfile | null, syncRemote = true) => {
      try {
        if (profile) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        console.warn("[BuyerAuthContext] Failed to persist buyer profile:", e);
      }

      const cleanTenant = (tenantSlug || "").toLowerCase().trim();
      if (syncRemote && profile && cleanTenant) {
        fetch("/api/storefront/buyer-profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantSlug: cleanTenant,
            ...profile,
          }),
        }).catch((err) => {
          console.warn("[BuyerAuthContext] Remote DB profile sync warning:", err);
        });
      }
    },
    [tenantSlug]
  );

  // Hydrate latest profile from dedicated tenant database when tenantSlug and buyer exist
  useEffect(() => {
    const cleanTenant = (tenantSlug || "").toLowerCase().trim();
    if (!cleanTenant || !buyer || (!buyer.email && !buyer.phone)) return;

    let cancelled = false;
    const params = new URLSearchParams({ tenant: cleanTenant });
    if (buyer.id) params.set("id", buyer.id);
    if (buyer.email) params.set("email", buyer.email);
    if (buyer.phone) params.set("phone", buyer.phone);

    fetch(`/api/storefront/buyer-profile?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.success && data.profile) {
          setBuyer(data.profile);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.profile));
          } catch {}
        } else if (data?.success && !data.profile) {
          // Push existing local profile into tenant's dedicated database
          persistBuyer(buyer, true);
        }
      })
      .catch(() => null);

    return () => {
      cancelled = true;
    };
  }, [tenantSlug, buyer?.id]);

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

      const activeProfile: BuyerProfile = existingProfile
        ? {
            ...existingProfile,
            addresses: Array.isArray(existingProfile.addresses) ? existingProfile.addresses : [],
            measurementPresets: Array.isArray(existingProfile.measurementPresets)
              ? existingProfile.measurementPresets
              : [],
            savedProducts: Array.isArray(existingProfile.savedProducts)
              ? existingProfile.savedProducts
              : [],
          }
        : {
            id: `buyer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            fullName: fullName || (cleanEmail ? cleanEmail.split("@")[0] : "Customer"),
            email: cleanEmail,
            phone: cleanPhone,
            city: "Lagos",
            addresses: [],
            measurementPresets: [],
            savedProducts: [],
            membershipTier: "Patron Member",
            createdAt: new Date().toISOString(),
          };

      const cleanTenant = (tenantSlug || "").toLowerCase().trim();
      if (cleanTenant) {
        try {
          const res = await fetch("/api/storefront/buyer-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenantSlug: cleanTenant,
              email: cleanEmail,
              phone: cleanPhone,
              fullName,
            }),
          });
          const data = await res.json().catch(() => null);
          if (res.ok && data?.success && data.profile) {
            setBuyer(data.profile);
            persistBuyer(data.profile, false);
            return { success: true };
          }
        } catch {}
      }

      setBuyer(activeProfile);
      persistBuyer(activeProfile, true);
      return { success: true };
    },
    [persistBuyer, tenantSlug]
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
        measurementPresets: [],
        savedProducts: [],
        membershipTier: "Patron Member",
        createdAt: new Date().toISOString(),
      };

      const cleanTenant = (tenantSlug || "").toLowerCase().trim();
      if (cleanTenant) {
        try {
          const res = await fetch("/api/storefront/buyer-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenantSlug: cleanTenant,
              ...newProfile,
            }),
          });
          const dbData = await res.json().catch(() => null);
          if (res.ok && dbData?.success && dbData.profile) {
            setBuyer(dbData.profile);
            persistBuyer(dbData.profile, false);
            return { success: true };
          }
        } catch {}
      }

      setBuyer(newProfile);
      persistBuyer(newProfile, true);
      return { success: true };
    },
    [persistBuyer, tenantSlug]
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

  const saveMeasurementPreset = useCallback(
    async (
      preset: Omit<BuyerMeasurementPreset, "id" | "createdAt"> & { id?: string }
    ): Promise<BuyerMeasurementPreset | null> => {
      let currentBuyer = buyer;
      if (!currentBuyer) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) currentBuyer = JSON.parse(raw);
        } catch {}
      }
      if (!currentBuyer) return null;

      const existingPresets = Array.isArray(currentBuyer.measurementPresets)
        ? currentBuyer.measurementPresets
        : [];
      const id = preset.id || `preset_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newPreset: BuyerMeasurementPreset = {
        id,
        name: preset.name.trim() || "My Bespoke Fit",
        measurements: preset.measurements,
        preferredPrint: preset.preferredPrint,
        preferredColor: preset.preferredColor,
        createdAt: new Date().toISOString(),
      };

      const idx = existingPresets.findIndex(
        (p) => p.id === id || p.name.toLowerCase() === newPreset.name.toLowerCase()
      );
      const nextPresets =
        idx > -1
          ? existingPresets.map((p, i) => (i === idx ? { ...newPreset, id: p.id } : p))
          : [newPreset, ...existingPresets];

      const updatedProfile: BuyerProfile = {
        ...currentBuyer,
        measurementPresets: nextPresets,
      };
      setBuyer(updatedProfile);
      persistBuyer(updatedProfile);
      return newPreset;
    },
    [buyer, persistBuyer]
  );

  const deleteMeasurementPreset = useCallback(
    async (id: string): Promise<boolean> => {
      if (!buyer) return false;
      const existingPresets = Array.isArray(buyer.measurementPresets)
        ? buyer.measurementPresets
        : [];
      const updatedProfile: BuyerProfile = {
        ...buyer,
        measurementPresets: existingPresets.filter((p) => p.id !== id),
      };
      setBuyer(updatedProfile);
      persistBuyer(updatedProfile);
      return true;
    },
    [buyer, persistBuyer]
  );

  const toggleSaveProduct = useCallback(
    async (product: Omit<BuyerSavedProduct, "savedAt">): Promise<{ saved: boolean }> => {
      let currentBuyer = buyer;
      if (!currentBuyer) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) currentBuyer = JSON.parse(raw);
        } catch {}
      }
      if (!currentBuyer) return { saved: false };

      const existingSaved = Array.isArray(currentBuyer.savedProducts)
        ? currentBuyer.savedProducts
        : [];
      const exists = existingSaved.some((p) => p.productId === product.productId);
      const nextSaved = exists
        ? existingSaved.filter((p) => p.productId !== product.productId)
        : [{ ...product, savedAt: new Date().toISOString() }, ...existingSaved];

      const updatedProfile: BuyerProfile = {
        ...currentBuyer,
        savedProducts: nextSaved,
      };
      setBuyer(updatedProfile);
      persistBuyer(updatedProfile);
      return { saved: !exists };
    },
    [buyer, persistBuyer]
  );

  const isProductSaved = useCallback(
    (productId: string): boolean => {
      if (!buyer || !Array.isArray(buyer.savedProducts)) return false;
      return buyer.savedProducts.some((p) => p.productId === productId);
    },
    [buyer]
  );

  const requireAuthModal = useCallback((reason: string, onSuccess?: () => void) => {
    setAuthModalReason(reason);
    setModalError(null);
    pendingCallbackRef.current = onSuccess;
    setAuthModalOpen(true);
  }, []);

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setIsSubmittingModal(true);

    try {
      const res =
        authMode === "signin"
          ? await login({ email: modalEmail, phone: modalPhone, fullName: modalFullName })
          : await register({
              fullName: modalFullName,
              email: modalEmail,
              phone: modalPhone,
              city: modalCity,
            });

      if (!res.success) {
        setModalError(res.error || "Authentication failed. Please check your details.");
        return;
      }

      setAuthModalOpen(false);
      const cb = pendingCallbackRef.current;
      pendingCallbackRef.current = undefined;
      if (cb) {
        setTimeout(() => cb(), 50);
      }
    } catch (err: any) {
      setModalError(err.message || "Unexpected error during authentication.");
    } finally {
      setIsSubmittingModal(false);
    }
  };

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
          measurementPresets: [],
          savedProducts: [],
          membershipTier: "Patron Member",
          createdAt: new Date().toISOString(),
        };

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
        saveMeasurementPreset,
        deleteMeasurementPreset,
        toggleSaveProduct,
        isProductSaved,
        requireAuthModal,
        syncWithOrder,
      }}
    >
      {children}

      {/* Global Storefront Account / Sign-In Modal for Protected Actions & Checkout */}
      {authModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setAuthModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-zinc-900 text-white p-6 relative">
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close Sign-In Modal"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Storefront Customer Profile</span>
              </div>
              <h3 className="font-dropa text-xl font-bold text-white">
                {authMode === "signin" ? "Sign In to Your Storefront Profile" : "Create Your Storefront Account"}
              </h3>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                {authModalReason ||
                  "Sign in or create a storefront account to save bespoke measurement presets, bookmark pieces, and complete checkout."}
              </p>
            </div>

            {/* Tabs */}
            <div className="p-2 bg-stone-100 border-b border-stone-200 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setModalError(null);
                }}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  authMode === "signin"
                    ? "bg-white text-zinc-900 shadow-xs border border-stone-200/80"
                    : "text-stone-600 hover:text-zinc-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setModalError(null);
                }}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  authMode === "register"
                    ? "bg-white text-zinc-900 shadow-xs border border-stone-200/80"
                    : "text-stone-600 hover:text-zinc-900"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {authMode === "register" && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={modalFullName}
                    onChange={(e) => setModalFullName(e.target.value)}
                    placeholder="e.g. Funke Adeyemi"
                    className="w-full px-4 py-2.5 rounded-full border border-stone-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required={authMode === "register" || !modalPhone}
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-full border border-stone-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Phone Number (WhatsApp)
                </label>
                <input
                  type="tel"
                  required={authMode === "register" || !modalEmail}
                  value={modalPhone}
                  onChange={(e) => setModalPhone(e.target.value)}
                  placeholder="+234 803 000 0000"
                  className="w-full px-4 py-2.5 rounded-full border border-stone-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>

              {authMode === "register" && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Primary City
                  </label>
                  <input
                    type="text"
                    value={modalCity}
                    onChange={(e) => setModalCity(e.target.value)}
                    placeholder="Lagos"
                    className="w-full px-4 py-2.5 rounded-full border border-stone-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingModal}
                className="w-full py-3.5 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {isSubmittingModal
                    ? "Authenticating..."
                    : authMode === "signin"
                    ? "Sign In & Continue"
                    : "Create Account & Continue"}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
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
