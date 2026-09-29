import React, { Suspense } from "react";
import { NICHE_DETAILS, getNicheData, getAllNicheSlugs } from "@/lib/niche-data";
import SearchClient from "./SearchClient";

export function generateStaticParams() {
  return getAllNicheSlugs().map((niche) => ({
    niche: niche,
  }));
}

export default async function NicheSearchPage({ params }: { params: Promise<{ niche: string }> }) {
  const resolvedParams = await params;

  const data = getNicheData(resolvedParams.niche);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchClient data={data} />
    </Suspense>
  );
}
