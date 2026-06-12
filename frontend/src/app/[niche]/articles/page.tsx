import React from "react";
import { NICHE_DETAILS } from "@/lib/niche-data";
import ArticlesClient from "./ArticlesClient";

export function generateStaticParams() {
  return Object.keys(NICHE_DETAILS).map((niche) => ({
    niche: niche,
  }));
}

export default function NicheArticlesPage({ params }: { params: { niche: string } }) {
  const nicheSlug = params.niche;
  const data = NICHE_DETAILS[nicheSlug] || NICHE_DETAILS["home-services"];

  return (
    <ArticlesClient data={data} />
  );
}
