import React from "react";
import SubServiceClient from "./SubServiceClient";
import { NICHE_DETAILS } from "@/lib/niche-data";

export function generateStaticParams() {
  const params: { niche: string, slug: string }[] = [];
  Object.keys(NICHE_DETAILS).forEach(niche => {
    params.push({ niche, slug: "painters" });
  });
  return params;
}

export default function CategoryPage({ params }: { params: { niche: string; slug: string } }) {
  return <SubServiceClient />;
}
