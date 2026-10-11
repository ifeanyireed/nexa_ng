"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";

export default function NewKBArticle() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category_id: "cat-1",
    content: "",
    status: "published",
  });

  const USERS_API = process.env.NEXT_PUBLIC_USERS_API || "http://localhost:8081";

  const defaultCategories = [
    { id: "cat-1", name: "Storefronts & DNS" },
    { id: "cat-2", name: "ERP & Accounting" },
    { id: "cat-3", name: "Mobility & Transit OS" },
    { id: "cat-4", name: "Autonomous AI Swarm" },
    { id: "cat-5", name: "Logistics & Dispatch" },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${USERS_API}/api/v1/support/kb/categories`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          setFormData((prev) => ({ ...prev, category_id: data[0].id }));
          return;
        }
      }
      setCategories(defaultCategories);
    } catch {
      setCategories(defaultCategories);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    setSaving(true);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("nexa_auth_token") || localStorage.getItem("resultspro_admin_token")
          : null;
      await fetch(`${USERS_API}/api/v1/support/kb/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...formData,
          slug: generateSlug(formData.title),
        }),
      });

      router.push("/support/kb");
    } catch {
      router.push("/support/kb");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SuperAdminShell
      title="Create Knowledge Base Article"
      subtitle="Publish guides, blueprints, and standard troubleshooting procedures for merchants."
      action={
        <Link
          href="/support/kb"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--nexa-text-secondary)] hover:text-nexa-brand transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Back to Knowledge Base</span>
        </Link>
      }
    >
      <div className="space-y-6 max-w-4xl">
        <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] shadow-sm space-y-5">

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
              Article Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. How to connect bluetooth receipt printers to Ofia POS"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-nexa-brand"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-nexa-brand cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                Publication Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-nexa-brand cursor-pointer"
              >
                <option value="published">Published</option>
                <option value="draft">Draft (Internal)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
              Article Content (Markdown / HTML)
            </label>
            <textarea
              required
              rows={12}
              placeholder="Write the full documentation article..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full p-4 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-nexa-brand leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--nexa-border)]">
            <Link href="/support/kb">
              <NexaButton variant="outline" size="sm" type="button">
                Cancel
              </NexaButton>
            </Link>
            <NexaButton variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? "Publishing..." : "Publish Article"}
            </NexaButton>
          </div>
        </form>
      </NexaCard>
    </div>
    </SuperAdminShell>
  );
}
