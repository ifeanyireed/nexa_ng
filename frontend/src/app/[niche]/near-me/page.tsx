import React from "react";
import { NICHE_DETAILS, getNicheData } from "@/lib/niche-data";
import NearMeClient from "./NearMeClient";

export function generateStaticParams() {
  return Object.keys(NICHE_DETAILS).map((niche) => ({
    niche: niche,
  }));
}

export default function NearMePage({ params }: { params: { niche: string } }) {
  const data = getNicheData(params.niche);
  
  return (
    <NearMeClient data={data} />
  );
}
