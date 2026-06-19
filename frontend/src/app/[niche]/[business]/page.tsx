import React from "react";
import BusinessClient from "./BusinessClient";
import { NICHE_DETAILS } from "@/lib/niche-data";

export default function BusinessProfilePage({ params }: { params: { niche: string; business: string } }) {
  const nicheSlug = params.niche;
  const data = NICHE_DETAILS[nicheSlug] || NICHE_DETAILS["home-services"];

  return <BusinessClient data={data} businessSlug={params.business} />;
}
