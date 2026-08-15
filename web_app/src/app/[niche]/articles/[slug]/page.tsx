import React from "react";
import ArticleDetailClient from "./ArticleDetailClient";
import { NICHE_DETAILS, getNicheData, getAllNicheSlugs } from "@/lib/niche-data";
import { slugify } from "@/lib/utils";

export async function generateStaticParams() {
  const niches = getAllNicheSlugs();
  const paths: any[] = [];
  
  niches.forEach(niche => {
    paths.push({ niche, slug: "guide" });
    paths.push({ niche, slug: "article-0" });
    paths.push({ niche, slug: "article-1" });
    paths.push({ niche, slug: "article-2" });
    paths.push({ niche, slug: "how-to-choose-best-expert" });
  });

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const res = await fetch(`${apiUrl}/discovery/articles`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const articles = await res.json();
      articles.forEach((art: any) => {
        const nicheSlug = art.niche;
        const slug = `${slugify(art.title)}-article-${art.id}`;
        paths.push({ niche: nicheSlug, slug });
        
        // Also support short niche URL slug
        const normalized: Record<string, string> = {
          "fashion-grooming": "fashion",
          "professional-services": "professionals",
          "education-skills": "education",
          "events-entertainment": "events",
          "health-wellness": "health",
          "logistics-transport": "logistics",
          "automotive-services": "auto",
          "food-agribusiness": "food",
          "real-estate-construction": "realestate"
        };
        const shortNiche = normalized[nicheSlug];
        if (shortNiche) {
          paths.push({ niche: shortNiche, slug });
        }

        // Also support specialty/service specific slugs in the URL
        if (art.proProfile?.specialties) {
          const specialtySlug = slugify(art.proProfile.specialties.split(",")[0]);
          paths.push({ niche: specialtySlug, slug });
        }
      });
    }
  } catch (error) {
    console.warn("Could not fetch articles for static params, using fallback:", error);
  }

  const uniquePaths = Array.from(new Set(paths.map(p => JSON.stringify(p)))).map(s => JSON.parse(s));
  return uniquePaths;
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ niche: string; slug: string }> }) {
  const resolvedParams = await params;

  const data = getNicheData(resolvedParams.niche);
  return <ArticleDetailClient data={data} />;
}
