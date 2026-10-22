"use client";

import { useState, useEffect } from "react";
import { Product, VerticalType } from "@/types/storefront";
import { MOCK_PRODUCTS } from "@/data/mockStores";
import { useStorefrontTenant } from "@/context/StorefrontTenantContext";

export function useStorefrontProducts(vertical: VerticalType) {
  const { tenantSlug } = useStorefrontTenant();
  const [products, setProducts] = useState<Product[]>(() =>
    MOCK_PRODUCTS.filter((p) => p.vertical === vertical)
  );
  const [isLiveMerchantCatalog, setIsLiveMerchantCatalog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      if (!tenantSlug) {
        setProducts(MOCK_PRODUCTS.filter((p) => p.vertical === vertical));
        setIsLiveMerchantCatalog(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/storefront/products?tenant=${encodeURIComponent(tenantSlug)}&vertical=${encodeURIComponent(vertical)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.products && data.products.length > 0) {
            setProducts(data.products);
            setIsLiveMerchantCatalog(Boolean(data.isLiveMerchantCatalog));
            return;
          }
        }
      } catch (err) {
        console.warn("[useStorefrontProducts] Failed to fetch live products, falling back to seeds:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }

      if (isMounted) {
        setProducts(MOCK_PRODUCTS.filter((p) => p.vertical === vertical));
        setIsLiveMerchantCatalog(false);
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [tenantSlug, vertical]);

  return { products, isLiveMerchantCatalog, isLoading };
}
