import React from "react";
import { NICHE_DETAILS, getNicheData, getAllNicheSlugs } from "@/lib/niche-data";
import AvailableClient from "./AvailableClient";

export function generateStaticParams() {
  return getAllNicheSlugs().map((niche) => ({
    niche: niche,
  }));
}

export default async function AvailableNowPage({ params }: { params: Promise<{ niche: string }> }) {
  const resolvedParams = await params;

  const data = getNicheData(resolvedParams.niche);

  return (
    <AvailableClient data={data} />
  );
}
