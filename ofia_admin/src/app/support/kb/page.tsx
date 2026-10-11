"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PlusIcon, TrashIcon, PencilSquareIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";

export default function KnowledgeBaseDashboard() {
  const [categories, setCategories] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const USERS_API = process.env.NEXT_PUBLIC_USERS_API || "http://localhost:8081";

  const fallbackCategories = [
    { id: "cat-1", name: "Storefronts & DNS", slug: "storefronts" },
    { id: "cat-2", name: "ERP & Accounting", slug: "erp-accounting" },
    { id: "cat-3", name: "Mobility & Transit OS", slug: "mobility" },
    { id: "cat-4", name: "Autonomous AI Swarm", slug: "ai-swarm" },
    { id: "cat-5", name: "Logistics & Dispatch", slug: "logistics" },
  ];

  const fallbackArticles = [
    {
      id: "art-1",
      title: "Configuring Custom Apex Domains (.ng / .com) on Ofia Storefronts",
      category_id: "cat-1",
      category_name: "Storefronts & DNS",
      excerpt: "Step-by-step instructions for pointing CNAME and A records to the African Edge proxy.",
      status: "published",
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: "art-2",
      title: "Reconciling 7.5% Nigerian FIRS VAT in General Ledger",
      category_id: "cat-2",
      category_name: "ERP & Accounting",
      excerpt: "How sales tax output logs and withholding tax entries automatically map to the general journal.",
      status: "published",
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
      id: "art-3",
      title: "Flota Intercity Coach Passenger Manifests & Seat Assignment",
      category_id: "cat-3",
      category_name: "Mobility & Transit OS",
      excerpt: "Managing boarding manifests, bus conductor check-in QR codes, and emergency manifest dispatch.",
      status: "published",
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    },
    {
      id: "art-4",
      title: "Autonomous Lead Re-engagement Swarm: Best Practices for WhatsApp",
      category_id: "cat-4",
      category_name: "Autonomous AI Swarm",
      excerpt: "Configuring safety boundaries, prompt engineering, and human-in-the-loop action approval desks.",
      status: "published",
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, artsRes] = await Promise.all([
        fetch(`${USERS_API}/api/v1/support/kb/categories`),
        fetch(`${USERS_API}/api/v1/support/kb/articles`),
      ]);

      if (catsRes.ok) {
        const cData = await catsRes.json();
        setCategories(Array.isArray(cData) && cData.length > 0 ? cData : fallbackCategories);
      } else {
        setCategories(fallbackCategories);
      }

      if (artsRes.ok) {
        const aData = await artsRes.json();
        setArticles(Array.isArray(aData) && aData.length > 0 ? aData : fallbackArticles);
      } else {
        setArticles(fallbackArticles);
      }
    } catch {
      setCategories(fallbackCategories);
      setArticles(fallbackArticles);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this guide article?")) return;

    setArticles((prev) => prev.filter((a) => a.id !== id));
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("nexa_auth_token") || localStorage.getItem("resultspro_admin_token")
          : null;
      await fetch(`${USERS_API}/api/v1/support/kb/articles/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {}
  };

  const filteredArticles = activeCategory
    ? articles.filter((a) => a.category_id === activeCategory)
    : articles;

  return (
    <SuperAdminShell
      title="Knowledge Base & Docs"
      subtitle="Curate technical documentation, onboarding manuals, and customer blueprints."
      action={
        <Link href="/support/kb/new">
          <NexaButton variant="primary" size="sm" leftIcon={<PlusIcon className="w-4 h-4" />}>
            New Article
          </NexaButton>
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Categories Sidebar */}
        <div className="md:col-span-4 lg:col-span-3 space-y-2">
          <NexaCard variant="glass" padding="md" className="border border-[var(--nexa-border)] shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--nexa-text-muted)] mb-3 px-1">
              Categories
            </h3>
            <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0 scrollbar-hide">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={`shrink-0 md:shrink text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-between gap-2 whitespace-nowrap ${
                  activeCategory === null
                    ? "bg-nexa-brand text-white shadow-xs font-bold"
                    : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)] bg-[var(--nexa-bg-base)]/50 md:bg-transparent"
                }`}
              >
                <span>All Articles</span>
                <span className="text-[10px] opacity-80">{articles.length}</span>
              </button>

              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCategory(c.id)}
                  className={`shrink-0 md:shrink text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-between gap-2 whitespace-nowrap ${
                    activeCategory === c.id
                      ? "bg-nexa-brand text-white shadow-xs font-bold"
                      : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)] bg-[var(--nexa-bg-base)]/50 md:bg-transparent"
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-[10px] opacity-80">
                    {articles.filter((a) => a.category_id === c.id).length}
                  </span>
                </button>
              ))}
            </div>
          </NexaCard>
        </div>

        {/* Articles List */}
        <div className="md:col-span-8 lg:col-span-9 space-y-3">
          <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] shadow-sm">
            {loading ? (
              <div className="py-12 text-center text-xs text-[var(--nexa-text-muted)]">
                Loading knowledge base articles...
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--nexa-text-muted)]">
                No articles published in this category yet.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredArticles.map((art) => (
                  <div
                    key={art.id}
                    className="p-4 rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:border-nexa-brand/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <DocumentTextIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[var(--nexa-text-primary)] group-hover:text-nexa-brand transition-colors">
                          {art.title}
                        </h4>
                        <p className="text-xs text-[var(--nexa-text-secondary)] mt-0.5 line-clamp-1">
                          {art.excerpt || "Comprehensive guide and operational checklist."}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-[var(--nexa-text-muted)]">
                          <span className="font-semibold text-nexa-brand">
                            {art.category_name || "Documentation"}
                          </span>
                          <span>•</span>
                          <span>Updated {new Date(art.updated_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Link href={`/support/kb/${art.id}`}>
                        <button
                          type="button"
                          className="p-2 rounded-xl border border-[var(--nexa-border)] hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] hover:text-nexa-brand transition-colors cursor-pointer"
                          title="Edit Guide"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(art.id, e)}
                        className="p-2 rounded-xl border border-[var(--nexa-border)] hover:bg-rose-500/10 text-[var(--nexa-text-secondary)] hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete Guide"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </NexaCard>
        </div>
      </div>
    </div>
    </SuperAdminShell>
  );
}
