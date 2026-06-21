import React from "react";
import { NICHE_DETAILS, getNicheData, getAllNicheSlugs } from "@/lib/niche-data";
import NicheHubClient from "./NicheHubClient";

export function generateStaticParams() {
  return getAllNicheSlugs().map((niche) => ({
    niche: niche,
  }));
}

export default async function NicheHubPage({ params }: { params: Promise<{ niche: string }> }) {
  const resolvedParams = await params;

  const data = getNicheData(resolvedParams.niche);

  return (
    <main className="bg-nexa-bg-base min-h-screen">
      <NicheHubClient data={data} />
    </main>
  );
}
