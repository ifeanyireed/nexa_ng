"use client";

import { useState, useEffect, useCallback } from "react";
import { Product, VerticalType } from "@/types/storefront";
import { useStorefrontTenant } from "@/context/StorefrontTenantContext";

export function useStorefrontProducts(vertical: VerticalType) {
  const { tenantSlug } = useStorefrontTenant();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLiveMerchantCatalog, setIsLiveMerchantCatalog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const refetch = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      if (!tenantSlug) {
        if (isMounted) {
          setProducts([]);
          setIsLiveMerchantCatalog(false);
          setError(null);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/storefront/products?tenant=${encodeURIComponent(tenantSlug)}&vertical=${encodeURIComponent(vertical)}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error || "Connect to Internet";
          if (isMounted) {
            setError(errMsg === "Connect to Internet" ? "Connect to Internet" : "Connect to Internet");
            setProducts([]);
            setIsLiveMerchantCatalog(false);
          }
          return;
        }

        const data = await res.json();
        if (isMounted) {
          setProducts(Array.isArray(data.products) ? data.products : []);
          setIsLiveMerchantCatalog(Boolean(data.isLiveMerchantCatalog));
          setError(null);
        }
      } catch (err) {
        console.warn("[useStorefrontProducts] Database fetch failed:", err);
        if (isMounted) {
          setError("Connect to Internet");
          setProducts([]);
          setIsLiveMerchantCatalog(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [tenantSlug, vertical, retryCount]);

  return { products, isLiveMerchantCatalog, isLoading, error, refetch };
}
