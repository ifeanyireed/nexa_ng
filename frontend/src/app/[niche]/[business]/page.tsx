import React from "react";
import BusinessClient from "./BusinessClient";
import { NICHE_DETAILS } from "@/lib/niche-data";

export function generateStaticParams() {
  const niches = Object.keys(NICHE_DETAILS);
  const businesses = ["example-business", "kola-handyman-services", "business-1", "business-2"];
  
  const params: { niche: string; business: string }[] = [];
  
  niches.forEach(niche => {
    businesses.forEach(business => {
      params.push({ niche, business });
    });
  });
  
  return params;
}

export default function BusinessProfilePage({ params }: { params: { niche: string; business: string } }) {
  const nicheSlug = params.niche;
  const data = NICHE_DETAILS[nicheSlug] || NICHE_DETAILS["home-services"];

  return <BusinessClient data={data} businessSlug={params.business} />;
}
