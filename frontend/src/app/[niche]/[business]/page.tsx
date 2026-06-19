import React from "react";
import BusinessClient from "./BusinessClient";
import { getNicheData } from "@/lib/niche-data";

export default function BusinessProfilePage({ params }: { params: { niche: string; business: string } }) {
  const data = getNicheData(params.niche);

  return <BusinessClient data={data} businessSlug={params.business} />;
}
