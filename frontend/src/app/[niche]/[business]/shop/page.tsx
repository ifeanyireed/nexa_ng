import React from "react";
import { getNicheData } from "@/lib/niche-data";
import StorefrontClient from "./StorefrontClient";

export default function ShopStorefrontPage({ params }: { params: { niche: string, business: string } }) {
  const data = getNicheData(params.niche);

  return <StorefrontClient data={data} />;
}
