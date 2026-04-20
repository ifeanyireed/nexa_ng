import React from "react";
import ArticleDetailClient from "./ArticleDetailClient";
import { NICHE_DETAILS } from "@/lib/niche-data";

export function generateStaticParams() {
  const niches = Object.keys(NICHE_DETAILS);
  const paths: any[] = [];
  
  niches.forEach(niche => {
    paths.push({ niche, slug: "guide" });
    paths.push({ niche, slug: "article-0" });
    paths.push({ niche, slug: "article-1" });
    paths.push({ niche, slug: "article-2" });
    paths.push({ niche, slug: "how-to-choose-best-expert" });
  });
  
  return paths;
}

export default function ArticleDetailPage({ params }: { params: { niche: string; slug: string } }) {
  const nicheSlug = params.niche;
  const data = NICHE_DETAILS[nicheSlug] || NICHE_DETAILS["home-services"];
  return <ArticleDetailClient data={data} />;
}
