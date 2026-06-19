import React from "react";
import { NICHE_DETAILS, getNicheData, getAllNicheSlugs } from "@/lib/niche-data";
import ShopClient from "./ShopClient";

export function generateStaticParams() {
  return getAllNicheSlugs().map((niche) => ({
    niche: niche,
  }));
}

export default function NicheShopPage({ params }: { params: { niche: string } }) {
  const data = getNicheData(params.niche);

  return (
    <ShopClient data={data} nicheSlug={params.niche} />
  );
}
