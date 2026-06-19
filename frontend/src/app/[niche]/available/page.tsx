import React from "react";
import { NICHE_DETAILS, getNicheData } from "@/lib/niche-data";
import AvailableClient from "./AvailableClient";

export function generateStaticParams() {
  return Object.keys(NICHE_DETAILS).map((niche) => ({
    niche: niche,
  }));
}

export default function AvailableNowPage({ params }: { params: { niche: string } }) {
  const data = getNicheData(params.niche);

  return (
    <AvailableClient data={data} />
  );
}
