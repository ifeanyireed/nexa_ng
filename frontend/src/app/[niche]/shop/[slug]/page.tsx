import React from "react";
import ProductDetailClient from "./ProductDetailClient";
import { NICHE_DETAILS, getNicheData } from "@/lib/niche-data";

export function generateStaticParams() {
  const niches = Object.keys(NICHE_DETAILS);
  const paths: any[] = [];
  
  niches.forEach(niche => {
    // Generate paths for the featured-product placeholder
    paths.push({ niche, slug: "featured-product" });
    // Generate paths for the standard product placeholders used in the UI
    paths.push({ niche, slug: "product-0" });
    paths.push({ niche, slug: "product-1" });
    paths.push({ niche, slug: "product-2" });
  });
  
  return paths;
}

export default function ProductDetailPage({ params }: { params: { niche: string; slug: string } }) {
  const data = getNicheData(params.niche);
  return <ProductDetailClient data={data} />;
}
