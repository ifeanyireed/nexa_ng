"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { NexaButton } from "@/components/nexa/NexaButton";
import { api } from "@/lib/api";
import { getNicheData } from "@/lib/niche-data";
import { Loader2, Info } from "lucide-react";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";

import BusinessClient from "./[niche]/[state]/[lga]/[business]/BusinessClient";
import StorefrontClient from "./[niche]/[state]/[lga]/[business]/shop/StorefrontClient";
import ArticleDetailClient from "./[niche]/articles/[slug]/ArticleDetailClient";

export default function NotFound() {
  const [checkingPath, setCheckingPath] = useState(true);
  const [resolvedType, setResolvedType] = useState<"profile" | "shop" | "article" | null>(null);
  const [resolvedData, setResolvedData] = useState<any>(null);
  const [nicheData, setNicheData] = useState<any>(null);
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") {
      setCheckingPath(false);
      return;
    }

    const checkUrlFallback = async () => {
      const pathname = window.location.pathname;
      const parts = pathname.split("/").filter(Boolean);

      try {
        // 1. Business Profile: /[niche]/[state]/[lga]/[business-slug]
        if (parts.length === 4 && parts[3].includes("-business-")) {
          const proId = parts[3].split("-business-")[1];
          const pro = await api.get(`/discovery/pros/${proId}`);
          if (pro) {
            setResolvedType("profile");
            setResolvedData(pro);
            setNicheData(getNicheData(parts[0]));
            setSlug(parts[3]);
            setCheckingPath(false);
            return;
          }
        }

        // 2. Business Shop: /[niche]/[state]/[lga]/[business-slug]/shop
        if (parts.length === 5 && parts[3].includes("-business-") && parts[4] === "shop") {
          const proId = parts[3].split("-business-")[1];
          const pro = await api.get(`/discovery/pros/${proId}`);
          if (pro) {
            setResolvedType("shop");
            setResolvedData(pro);
            setNicheData(getNicheData(parts[0]));
            setSlug(parts[3]);
            setCheckingPath(false);
            return;
          }
        }

        // 3. Article Detail: /[niche]/articles/[article-slug]
        if (parts.length === 3 && parts[1] === "articles" && parts[2].includes("-article-")) {
          const articleId = parts[2].split("-article-")[1];
          const article = await api.get(`/discovery/articles/${articleId}`);
          if (article) {
            setResolvedType("article");
            setResolvedData(article);
            setNicheData(getNicheData(parts[0]));
            setSlug(parts[2]);
            setCheckingPath(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Path fallback check failed:", err);
      }

      setCheckingPath(false);
    };

    checkUrlFallback();
  }, []);

  if (checkingPath) {
    return (
      <main className="min-h-screen bg-nexa-bg-base flex flex-col items-center justify-center p-4">
        <NexaNavbar />
        <div className="text-center space-y-6 pt-32">
          <div className="w-16 h-16 rounded-full bg-nexa-brand/10 flex items-center justify-center mx-auto text-nexa-brand">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-2xl font-extrabold text-display">Checking Nexa network...</h2>
          <p className="text-nexa-text-secondary text-sm max-w-xs mx-auto">
            Resolving page dynamic routes. If this page is newly created, we are loading it for you.
          </p>
        </div>
        <NexaBottomBar />
      </main>
    );
  }

  if (resolvedType === "profile" && resolvedData) {
    return (
      <main className="bg-nexa-bg-base min-h-screen">
        <BusinessClient data={nicheData} businessSlug={slug} />
      </main>
    );
  }

  if (resolvedType === "shop" && resolvedData) {
    return (
      <main className="bg-nexa-bg-base min-h-screen">
        <StorefrontClient data={nicheData} />
      </main>
    );
  }

  if (resolvedType === "article" && resolvedData) {
    return (
      <main className="bg-nexa-bg-base min-h-screen">
        <ArticleDetailClient data={nicheData} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-nexa-bg-base flex flex-col items-center justify-center p-4 text-center">
      <NexaNavbar />
      <div className="text-center space-y-6 max-w-sm pt-32 pb-24">
        <div className="w-20 h-20 rounded-full bg-nexa-bg-surface flex items-center justify-center mx-auto text-nexa-text-faint border border-nexa-border">
          <Info className="w-10 h-10" />
        </div>
        <h2 className="text-4xl font-extrabold text-display">404 - Not Found</h2>
        <p className="text-nexa-text-secondary">
          The page you are looking for doesn't exist, has been removed, or is still compiling.
        </p>
        <Link href="/">
          <NexaButton size="lg" className="shadow-lg shadow-nexa-brand/20">Return Home</NexaButton>
        </Link>
      </div>
      <NexaBottomBar />
    </main>
  );
}
