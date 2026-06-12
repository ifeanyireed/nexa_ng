import React from "react";
import { NICHE_DETAILS } from "@/lib/niche-data";
import NicheHubClient from "./NicheHubClient";

export function generateStaticParams() {
  return Object.keys(NICHE_DETAILS).map((niche) => ({
    niche: niche,
  }));
}

export default function NicheHubPage({ params }: { params: { niche: string } }) {
  const nicheSlug = params.niche;
  const data = NICHE_DETAILS[nicheSlug] || NICHE_DETAILS["home-services"];

  return (
    <main className="bg-nexa-bg-base min-h-screen">
      <NicheHubClient data={data} />
    </main>
  );
}
