import React, { Suspense } from "react";
import { NICHE_DETAILS, getNicheData, getAllNicheSlugs } from "@/lib/niche-data";
import SearchClient from "./SearchClient";

export function generateStaticParams() {
  return getAllNicheSlugs().map((niche) => ({
    niche: niche,
  }));
}

export default function NicheSearchPage({ params }: { params: { niche: string } }) {
  const data = getNicheData(params.niche);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchClient data={data} />
    </Suspense>
  );
}
