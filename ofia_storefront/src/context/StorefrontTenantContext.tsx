"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { TenantStorefrontHandshake, VendorStore, VerticalType } from "@/types/storefront";
import {
  extractSubdomainFromHost,
  resolveTenantFromHostAndQuery,
  resolveTenantVertical,
  buildDynamicVendorStore,
  SEED_TENANT_HANDSHAKES,
} from "@/lib/storefront-tenant";
import { MOCK_STORES } from "@/data/mockStores";
import StorefrontLoadingScreen from "@/components/common/StorefrontLoadingScreen";
import UnprovisionedStorefrontErrorView from "@/components/common/UnprovisionedStorefrontErrorView";

export interface TenantResolutionError {
  code?: number;
  title?: string;
  message?: string;
  slug?: string;
}

interface StorefrontTenantContextType {
  tenantSlug: string | null;
  handshake: TenantStorefrontHandshake | null;
  store: VendorStore;
  vertical: VerticalType;
  isShopEnabled: boolean;
  isFeatureEnabled: (featureKey: string) => boolean;
  isLoading: boolean;
  tenantError: TenantResolutionError | null;
}

const StorefrontTenantContext = createContext<StorefrontTenantContextType | undefined>(undefined);

export function StorefrontTenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [handshake, setHandshake] = useState<TenantStorefrontHandshake | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tenantError, setTenantError] = useState<TenantResolutionError | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    let resolvedSlug: string | null = null;

    if (typeof window !== "undefined") {
      // Resolve tenant strictly from host (subdomain or custom domain), ignoring query params
      const resolution = resolveTenantFromHostAndQuery(window.location.host);
      resolvedSlug = resolution.tenantSlug;
    }

    setTenantSlug(resolvedSlug);

    async function loadTenantHandshake(slug: string) {
      try {
        // Check local storage studio cache first (immediate reactivity from My Store Studio saves)
        let cachedStudioConfig: any = null;
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem(`tenant_storefront_config_${slug}`);
          if (raw) {
            try {
              cachedStudioConfig = JSON.parse(raw);
            } catch {}
          }
        }

        // Fetch from storefront config API
        const res = await fetch(`/api/storefront/config?tenant=${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.handshake) {
            let activeHandshake: TenantStorefrontHandshake = data.handshake;

            // Merge local studio cache if present
            if (cachedStudioConfig) {
              activeHandshake = {
                ...activeHandshake,
                vertical: (cachedStudioConfig.vertical as VerticalType) || activeHandshake.vertical,
                storefrontConfig: {
                  ...activeHandshake.storefrontConfig,
                  storeName: cachedStudioConfig.storeName || activeHandshake.storefrontConfig.storeName,
                  headline: cachedStudioConfig.storeHeadline || activeHandshake.storefrontConfig.headline,
                  primaryColor: cachedStudioConfig.primaryColor || activeHandshake.storefrontConfig.primaryColor,
                  secondaryColor: cachedStudioConfig.secondaryColor || activeHandshake.storefrontConfig.secondaryColor,
                  bannerUrl: cachedStudioConfig.bannerUrl || activeHandshake.storefrontConfig.bannerUrl,
                  sectionVisibility: {
                    ...activeHandshake.storefrontConfig.sectionVisibility,
                    ...(cachedStudioConfig.sectionVisibility || {}),
                  },
                },
              };
            }

            setHandshake(activeHandshake);
            setTenantError(null);

            // Synchronize tenant cookies for edge middleware
            if (typeof document !== "undefined") {
              try {
                document.cookie = `ofia_tenant_slug=${encodeURIComponent(slug)}; path=/; max-age=2592000; SameSite=Lax`;
                document.cookie = `ofia_tenant_vertical=${encodeURIComponent(activeHandshake.vertical)}; path=/; max-age=2592000; SameSite=Lax`;
              } catch {}
            }

            // Apply dynamic brand colors to CSS variables
            if (activeHandshake.storefrontConfig.primaryColor) {
              document.documentElement.style.setProperty("--primary-color", activeHandshake.storefrontConfig.primaryColor);
            }
            if (activeHandshake.storefrontConfig.secondaryColor) {
              document.documentElement.style.setProperty("--accent-color", activeHandshake.storefrontConfig.secondaryColor);
            }

            return;
          }
        }

        // Fallback to seed preset
        if (SEED_TENANT_HANDSHAKES[slug]) {
          setHandshake(SEED_TENANT_HANDSHAKES[slug]);
          setTenantError(null);
          return;
        }

        // Slug is NOT provisioned on the platform: fail fast with technical error!
        const errData = await res.json().catch(() => null);
        setTenantError({
          code: res.status === 404 ? 404 : 400,
          title: "Storefront Workspace Not Provisioned",
          message: errData?.error || `The merchant workspace '${slug}' has not been provisioned or is inactive on Ofia Platform.`,
          slug: slug,
        });
        setHandshake(null);
      } catch (err) {
        console.warn("[Storefront Tenant Context] Failed to resolve handshake:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (resolvedSlug) {
      loadTenantHandshake(resolvedSlug);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Synchronize document title to Tenant's name
  useEffect(() => {
    if (handshake?.name && typeof document !== "undefined") {
      document.title = handshake.name;
    }
  }, [handshake]);

  const vertical: VerticalType = useMemo(() => {
    if (handshake?.vertical) return handshake.vertical;
    return "fashion";
  }, [handshake]);

  const store: VendorStore = useMemo(() => {
    if (handshake) {
      return buildDynamicVendorStore(handshake, MOCK_STORES[handshake.vertical]);
    }
    return MOCK_STORES[vertical] || MOCK_STORES.fashion;
  }, [handshake, vertical]);

  const isShopEnabled = useMemo(() => {
    if (!handshake) return true;
    return handshake.provisioning.isShopEnabled !== false;
  }, [handshake]);

  const isFeatureEnabled = (featureKey: string): boolean => {
    if (!handshake) return true;

    // Check sub-module provisioning first
    if (featureKey in handshake.provisioning.shopSubModules) {
      if (handshake.provisioning.shopSubModules[featureKey] === false) {
        return false;
      }
    }

    // Check store studio section visibility
    if (featureKey === "services") {
      const isSubProvisioned = handshake.provisioning.shopSubModules.services !== false;
      const isSectionVisible = handshake.storefrontConfig.sectionVisibility.services !== false;
      return isSubProvisioned && isSectionVisible;
    }

    if (featureKey === "dispatchBooking" || featureKey === "dispatch") {
      return handshake.storefrontConfig.sectionVisibility.dispatchBooking !== false;
    }

    if (featureKey === "reviews") {
      return handshake.storefrontConfig.sectionVisibility.reviews !== false;
    }

    if (featureKey === "hero") {
      return handshake.storefrontConfig.sectionVisibility.hero !== false;
    }

    return true;
  };

  const contextValue = useMemo(
    () => ({
      tenantSlug,
      handshake,
      store,
      vertical,
      isShopEnabled,
      isFeatureEnabled,
      isLoading,
      tenantError,
    }),
    [tenantSlug, handshake, store, vertical, isShopEnabled, isLoading, tenantError]
  );

  // Avoid SSR / client hydration mismatches before initial client mount
  if (!isMounted) {
    return (
      <StorefrontTenantContext.Provider value={contextValue}>
        {children}
      </StorefrontTenantContext.Provider>
    );
  }

  // 1. If tenant resolution failed with an unprovisioned slug error: render dedicated 404 view
  if (tenantError) {
    return (
      <StorefrontTenantContext.Provider value={contextValue}>
        <UnprovisionedStorefrontErrorView error={tenantError} />
      </StorefrontTenantContext.Provider>
    );
  }

  // 2. While resolving tenant credentials: display smooth grey wireframe skeleton (no vertical flashing)
  if (isLoading && tenantSlug) {
    return (
      <StorefrontTenantContext.Provider value={contextValue}>
        <StorefrontLoadingScreen tenantSlug={tenantSlug} />
      </StorefrontTenantContext.Provider>
    );
  }

  return (
    <StorefrontTenantContext.Provider value={contextValue}>
      {children}
    </StorefrontTenantContext.Provider>
  );
}

export function useStorefrontTenant() {
  const context = useContext(StorefrontTenantContext);
  if (!context) {
    throw new Error("useStorefrontTenant must be used within a StorefrontTenantProvider");
  }
  return context;
}
