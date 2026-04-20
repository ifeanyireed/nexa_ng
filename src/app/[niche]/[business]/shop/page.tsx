import React from "react";
import { NICHE_DETAILS } from "@/lib/niche-data";
import StorefrontClient from "./StorefrontClient";

export function generateStaticParams() {
  const niches = Object.keys(NICHE_DETAILS);
  return niches.map((niche) => ({
    niche: niche,
    business: "example-business",
  }));
}

export default function ShopStorefrontPage({ params }: { params: { niche: string, business: string } }) {
  const nicheSlug = params.niche;
  const data = NICHE_DETAILS[nicheSlug] || NICHE_DETAILS["home-services"];

  return <StorefrontClient data={data} />;
}
