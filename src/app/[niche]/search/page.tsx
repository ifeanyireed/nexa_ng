import React, { Suspense } from "react";
import { NICHE_DETAILS } from "@/lib/niche-data";
import SearchClient from "./SearchClient";

export function generateStaticParams() {
  return Object.keys(NICHE_DETAILS).map((niche) => ({
    niche: niche,
  }));
}

export default function NicheSearchPage({ params }: { params: { niche: string } }) {
  const nicheSlug = params.niche;
  const data = NICHE_DETAILS[nicheSlug] || NICHE_DETAILS["home-services"];

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchClient data={data} />
    </Suspense>
  );
}
