import React from "react";
import { NICHE_DETAILS, getNicheData, getAllNicheSlugs } from "@/lib/niche-data";
import NearMeClient from "./NearMeClient";

export function generateStaticParams() {
  return getAllNicheSlugs().map((niche) => ({
    niche: niche,
  }));
}

export default async function NearMePage({ params }: { params: Promise<{ niche: string }> }) {
  const resolvedParams = await params;

  const data = getNicheData(resolvedParams.niche);
  
  return (
    <NearMeClient data={data} />
  );
}
