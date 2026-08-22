import React from "react";
import { NICHE_DETAILS, getNicheData, getAllNicheSlugs } from "@/lib/niche-data";
import NicheHubClient from "./NicheHubClient";
import { redirect } from "next/navigation";

export function generateStaticParams() {
  return getAllNicheSlugs().map((niche) => ({
    niche: niche,
  }));
}

export default async function NicheHubPage({ params }: { params: Promise<{ niche: string }> }) {
  const resolvedParams = await params;

  if (resolvedParams.niche === "category") {
    redirect("/categories");
  }

  const data = getNicheData(resolvedParams.niche);

  return (
    <main className="bg-nexa-bg-base min-h-screen">
      <NicheHubClient data={data} />
    </main>
  );
}
