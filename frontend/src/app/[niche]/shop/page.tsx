import React from "react";
import { NICHE_DETAILS, getNicheData, getAllNicheSlugs } from "@/lib/niche-data";
import ShopClient from "./ShopClient";

export function generateStaticParams() {
  return getAllNicheSlugs().map((niche) => ({
    niche: niche,
  }));
}

export default async function NicheShopPage({ params }: { params: Promise<{ niche: string }> }) {
  const resolvedParams = await params;

  const data = getNicheData(resolvedParams.niche);

  return (
    <ShopClient data={data} nicheSlug={resolvedParams.niche} />
  );
}
