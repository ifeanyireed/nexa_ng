import React from "react";
import { NICHE_DETAILS, getNicheData } from "@/lib/niche-data";
import NicheHubClient from "./NicheHubClient";

export function generateStaticParams() {
  return Object.keys(NICHE_DETAILS).map((niche) => ({
    niche: niche,
  }));
}

export default function NicheHubPage({ params }: { params: { niche: string } }) {
  const data = getNicheData(params.niche);

  return (
    <main className="bg-nexa-bg-base min-h-screen">
      <NicheHubClient data={data} />
    </main>
  );
}
