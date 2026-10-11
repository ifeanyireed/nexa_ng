"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";

export default function EditKBArticle() {
  const router = useRouter();
  const routeParams = useParams();
  const articleId = routeParams?.id as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    category_id: "cat-1",
    content: "",
    status: "published",
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [articleId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [catsRes, artRes] = await Promise.all([
        fetch(`/api/support/kb/categories`),
        fetch(`/api/support/kb/articles/${articleId}`),
      ]);

      if (catsRes.ok) {
        const cData = await catsRes.json();
        setCategories(Array.isArray(cData) ? cData : []);
      } else {
        setCategories([]);
      }

      if (artRes.ok) {
        const article = await artRes.json();
        setFormData({
          title: article.title,
          category_id: article.category_id,
          content: article.content,
          status: article.status || "published",
        });
        setError(null);
      } else {
        setError(`Article not found in database (HTTP ${artRes.status})`);
      }
    } catch (err: any) {
      setCategories([]);
      setError("Database connection error: " + (err?.message || "Failed to reach server"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("nexa_auth_token") || localStorage.getItem("resultspro_admin_token")
          : null;
      await fetch(`/api/support/kb/articles/${articleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      router.push("/support/kb");
    } catch {
      router.push("/support/kb");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SuperAdminShell
        title="Edit Knowledge Base Article"
        subtitle="Loading article details..."
      >
        <div className="p-12 text-center text-xs text-[var(--nexa-text-muted)]">
          Loading article details...
        </div>
      </SuperAdminShell>
    );
  }

  if (!loading && error) {
    return (
      <SuperAdminShell
        title="Knowledge Base Article"
        subtitle="Article not found or unavailable."
      >
        <div className="p-12 text-center space-y-4">
          <p className="text-xs text-rose-500 font-semibold">{error}</p>
          <Link
            href="/support/kb"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-nexa-brand hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Knowledge Base</span>
          </Link>
        </div>
      </SuperAdminShell>
    );
  }

  return (
    <SuperAdminShell
      title={formData.title ? `Edit: ${formData.title}` : "Edit Knowledge Base Article"}
      subtitle="Update documentation content, instructions, and taxonomy."
      action={
        <Link
          href="/support/kb"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--nexa-text-secondary)] hover:text-nexa-brand transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
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
              {saving ? "Saving Changes..." : "Save Changes"}
            </NexaButton>
          </div>
        </form>
      </NexaCard>
    </div>
    </SuperAdminShell>
  );
}
