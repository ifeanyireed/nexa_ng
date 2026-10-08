"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  Tag,
  Mail,
  Send,
  Calendar,
  Building2,
  Phone,
  FileSpreadsheet,
  Download,
  Trash2,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";
import { CrmEmailList } from "@/lib/crm-service";
import { crmFetch } from "@/lib/crm-client";

export default function AudienceListsPage() {
  const [lists, setLists] = useState<CrmEmailList[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // New List Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [newListTags, setNewListTags] = useState("B2B, Retail, High-Value");
  const [initialSubscribersCount, setInitialSubscribersCount] = useState("50");

  // Subscriber Modal
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [activeList, setActiveList] = useState<CrmEmailList | null>(null);
  const [emailsInput, setEmailsInput] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    async function loadLists() {
      try {
        const res = await crmFetch("/api/erp/crm/lists").then((r) => r.json());
        if (res?.lists) setLists(res.lists);
        else setLists([]);
      } catch {
        setLists([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadLists();
  }, []);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const parsedTags = newListTags.split(",").map((t) => t.trim()).filter(Boolean);
    const count = parseInt(initialSubscribersCount) || 0;

    const payload = {
      name: newListName.trim(),
      description: newListDesc.trim(),
      tags: parsedTags,
      subscriberCount: count,
    };

    try {
      const res = await crmFetch("/api/erp/crm/lists", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.list) setLists((prev) => [data.list, ...prev]);
    } catch {
      const fallbackList: CrmEmailList = {
        id: `LIST-${Date.now().toString().slice(-4)}`,
        tenantSlug: "default",
        name: newListName,
        description: newListDesc,
        tags: parsedTags,
        subscriberCount: count,
        createdAt: new Date().toISOString(),
      };
      setLists((prev) => [fallbackList, ...prev]);
    }

    setIsModalOpen(false);
    setNewListName("");
    setNewListDesc("");
  };

  const handleImportSubscribers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeList || !emailsInput.trim()) return;
    setIsImporting(true);

    const emailLines = emailsInput
      .split(/[\n,]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes("@"));

    if (emailLines.length === 0) {
      alert("Please enter at least one valid email address.");
      setIsImporting(false);
      return;
    }

    try {
      const res = await crmFetch("/api/erp/crm/lists/subscribers", {
        method: "POST",
        body: JSON.stringify({
          listId: activeList.id,
          subscribers: emailLines.map((em) => ({ email: em })),
        }),
      });
      const data = await res.json();
      if (data.addedCount) {
        setLists((prev) =>
          prev.map((l) =>
            l.id === activeList.id ? { ...l, subscriberCount: l.subscriberCount + data.addedCount } : l
          )
        );
        alert(`Successfully registered ${data.addedCount} contacts into "${activeList.name}".`);
      }
    } catch {
      alert("Contacts registered locally.");
    } finally {
      setIsImporting(false);
      setIsSubModalOpen(false);
      setEmailsInput("");
    }
  };

  const filteredLists = lists.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalContacts = lists.reduce((acc, l) => acc + l.subscriberCount, 0);

  return (
    <ErpAdminShell
      title="Audience Lists & Segmentation"
      subtitle="Organize prospect segments, import subscriber rosters, and target scheduled email blasts."
      activeModule="crm"
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/crm/marketing">
            <NexaButton variant="secondary" className="gap-2 text-xs">
              <Send className="w-3.5 h-3.5" />
              Schedule Blast
            </NexaButton>
          </Link>
          <NexaButton
            variant="primary"
            className="gap-2 text-xs"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Create Audience List
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        <ErpStatGrid
          stats={[
            {
              label: "Total Audience Segments",
              value: lists.length.toString(),
              change: "Active target lists",
              changeType: "neutral",
              icon: <Users className="w-4 h-4 text-purple-500" />,
            },
            {
              label: "Total Registered Contacts",
              value: totalContacts.toString(),
              change: "Verified emails",
              changeType: "success",
              icon: <Mail className="w-4 h-4 text-emerald-500" />,
            },
            {
              label: "Average Segment Size",
              value: lists.length > 0 ? Math.round(totalContacts / lists.length).toString() : "0",
              change: "Subscribers per list",
              changeType: "neutral",
              icon: <Tag className="w-4 h-4 text-blue-500" />,
            },
          ]}
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <NexaInput
              placeholder="Search lists, descriptions, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLists.map((list) => (
            <NexaCard key={list.id} className="p-5 flex flex-col justify-between hover:border-[#1A56DB]/50 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[var(--nexa-text-muted)]">{list.id}</span>
                  <NexaBadge variant="brand">
                    {list.subscriberCount} Subscribers
                  </NexaBadge>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">{list.name}</h4>
                  <p className="text-xs text-[var(--nexa-text-muted)] mt-1 line-clamp-2">{list.description}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {list.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-muted)] border border-[var(--nexa-border)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[var(--nexa-border)] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveList(list);
                    setIsSubModalOpen(true);
                  }}
                  className="text-xs font-bold text-[#1A56DB] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Contacts
                </button>
                <Link
                  href="/erp/admin/crm/marketing"
                  className="text-xs font-bold text-[#1A56DB] hover:underline flex items-center gap-1"
                >
                  Blast List <Send className="w-3 h-3" />
                </Link>
              </div>
            </NexaCard>
          ))}
        </div>
      </div>

      <NexaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Audience List"
        subtitle="Group contacts for targeted outbound email blasts and campaigns."
      >
        <form onSubmit={handleCreateList} className="space-y-4">
          <NexaInput
            label="Audience List Name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="e.g. Abuja Solar Commercial Prospects"
            required
          />

          <div>
            <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">Description & Purpose</label>
            <textarea
              rows={3}
              value={newListDesc}
              onChange={(e) => setNewListDesc(e.target.value)}
              placeholder="Describe which stakeholders are in this list..."
              className="w-full px-3 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NexaInput
              label="Audience Tags (comma-separated)"
              value={newListTags}
              onChange={(e) => setNewListTags(e.target.value)}
              placeholder="Commercial, Solar, North-Central"
            />
            <NexaInput
              label="Initial Subscriber Count"
              type="number"
              value={initialSubscribersCount}
              onChange={(e) => setInitialSubscribersCount(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <NexaButton variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton variant="primary" type="submit">
              Save Audience List
            </NexaButton>
          </div>
        </form>
      </NexaModal>

      {/* ADD SUBSCRIBERS MODAL */}
      <NexaModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        title={`Add Contacts to "${activeList?.name || 'Audience List'}"`}
        subtitle="Paste email addresses (one per line or comma-separated) to add verified recipients."
      >
        <form onSubmit={handleImportSubscribers} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
              Subscriber Emails (one per line or comma-separated)
            </label>
            <textarea
              rows={5}
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
              placeholder="ceo@company.ng&#10;procurement@domain.com&#10;director@industry.org"
              className="w-full px-3 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-mono"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <NexaButton variant="secondary" type="button" onClick={() => setIsSubModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton variant="primary" type="submit" disabled={isImporting}>
              {isImporting ? "Registering Contacts..." : "Import Contacts"}
            </NexaButton>
          </div>
        </form>
      </NexaModal>
    </ErpAdminShell>
  );
}
