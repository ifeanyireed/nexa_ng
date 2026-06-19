import React from "react";
import ArticleDetailClient from "./ArticleDetailClient";
import { NICHE_DETAILS, getNicheData } from "@/lib/niche-data";

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
  const data = getNicheData(params.niche);
  return <ArticleDetailClient data={data} />;
}
