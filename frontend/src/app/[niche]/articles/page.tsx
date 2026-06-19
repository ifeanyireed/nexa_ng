import React from "react";
import { NICHE_DETAILS, getNicheData, getAllNicheSlugs } from "@/lib/niche-data";
import ArticlesClient from "./ArticlesClient";

export function generateStaticParams() {
  return getAllNicheSlugs().map((niche) => ({
    niche: niche,
  }));
}

export default function NicheArticlesPage({ params }: { params: { niche: string } }) {
  const data = getNicheData(params.niche);

  return (
    <ArticlesClient data={data} />
  );
}
