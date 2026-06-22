import React from "react";
import { getNicheData } from "@/lib/niche-data";
import { slugify, getProSlug } from "@/lib/utils";
import StorefrontClient from "./StorefrontClient";

export async function generateStaticParams() {
  const paths = [
    {
      niche: "home-services",
      state: "lagos",
      lga: "lekki",
      business: "example-business"
    }
  ];

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const res = await fetch(`${apiUrl}/discovery/pros`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const pros = await res.json();
      pros.forEach((pro: any) => {
        const niche = slugify(pro.specialties?.split(",")[0] || pro.niche || "service");
        const state = slugify(pro.city || "state");
        const lga = slugify(pro.area || "lga");
        const business = getProSlug(pro);
        
        paths.push({
          niche,
          state,
          lga,
          business
        });
      });
    }
  } catch (error) {
    console.warn("Could not fetch pros for static params shop:", error);
  }

  const uniquePaths = Array.from(new Set(paths.map(p => JSON.stringify(p)))).map(s => JSON.parse(s));
  return uniquePaths;
}

export default async function ShopStorefrontPage({ params }: { params: Promise<{ niche: string, state: string, lga: string, business: string }> }) {
  const resolvedParams = await params;

  const data = getNicheData(resolvedParams.niche);
  return <StorefrontClient data={data} />;
}
