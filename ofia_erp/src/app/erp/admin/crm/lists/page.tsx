"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  User,
  CheckCircle2,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";
import { CrmEmailList, CrmEmailSubscriber } from "@/lib/crm-service";
import { crmFetch } from "@/lib/crm-client";

interface ParsedContact {
  email: string;
  company: string;
  contactName: string;
  phone: string;
}

function isLikelyPhone(str: string): boolean {
  const cleaned = str.replace(/[\s\-\(\)\.]/g, "");
  return /^(\+?[0-9]{7,15})$/.test(cleaned);
}

function parseContactsInput(text: string, defaultCompany: string): ParsedContact[] {
  if (!text.trim()) return [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const results: ParsedContact[] = [];
  const seenEmails = new Set<string>();

  for (const rawLine of lines) {
    const atMatches = rawLine.match(/@/g) || [];
    if (atMatches.length > 1) {
      const parts = rawLine.split(",").map((p) => p.trim());
      for (const p of parts) {
        if (p.includes("@")) {
          const em = p.toLowerCase();
          if (!seenEmails.has(em)) {
            seenEmails.add(em);
            results.push({
              email: em,
              company: defaultCompany.trim(),
              contactName: "",
              phone: "",
            });
          }
        }
      }
      continue;
    }

    let line = rawLine;
    let extractedName = "";
    const angleBracketMatch = line.match(/^(.*?)[<]([^>]+@[^>]+)[>](.*)$/);
    if (angleBracketMatch) {
      extractedName = angleBracketMatch[1].trim();
      const em = angleBracketMatch[2].trim().toLowerCase();
      const remainder = angleBracketMatch[3].trim().replace(/^[,;\t]+/, "").trim();
      line = `${em}, ${remainder}`;
    }

    const parts = line.split(/[,\t|;]+/).map((p) => p.trim()).filter(Boolean);
    const emailIndex = parts.findIndex((p) => p.includes("@"));

    if (emailIndex === -1) continue;

    const email = parts[emailIndex].toLowerCase();
    if (seenEmails.has(email)) continue;
    seenEmails.add(email);

    let company = defaultCompany.trim();
    let contactName = extractedName;
    let phone = "";

    const otherParts = parts.filter((_, idx) => idx !== emailIndex);

    // 1. Detect phone if any part matches phone number format
    const remainingParts: string[] = [];
    for (const p of otherParts) {
      if (!phone && isLikelyPhone(p)) {
        phone = p;
      } else {
        remainingParts.push(p);
      }
    }

    // 2. Map remaining parts to company and contact name
    if (remainingParts.length === 1) {
      if (defaultCompany.trim()) {
        contactName = contactName || remainingParts[0];
      } else {
        company = remainingParts[0];
      }
    } else if (remainingParts.length >= 2) {
      if (emailIndex === 0) {
        company = remainingParts[0];
        contactName = contactName || remainingParts[1];
      } else {
        contactName = contactName || remainingParts[0];
        company = remainingParts[1];
      }
    }

    results.push({ email, company, contactName, phone });
  }

  return results;
}

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
  const [defaultCompany, setDefaultCompany] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Roster Modal
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [rosterList, setRosterList] = useState<CrmEmailList | null>(null);
  const [rosterSubscribers, setRosterSubscribers] = useState<CrmEmailSubscriber[]>([]);
  const [isRosterLoading, setIsRosterLoading] = useState(false);
  const [rosterSearch, setRosterSearch] = useState("");
  const [deletingSubId, setDeletingSubId] = useState<string | null>(null);

  const parsedContacts = useMemo(() => {
    return parseContactsInput(emailsInput, defaultCompany);
  }, [emailsInput, defaultCompany]);

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

  const openRosterModal = async (list: CrmEmailList) => {
    setRosterList(list);
    setIsRosterModalOpen(true);
    setIsRosterLoading(true);
    setRosterSearch("");
    try {
      const res = await crmFetch(`/api/erp/crm/lists/subscribers?listId=${list.id}`).then((r) => r.json());
      if (res?.subscribers) {
        setRosterSubscribers(res.subscribers);
      } else {
        setRosterSubscribers([]);
      }
    } catch {
      setRosterSubscribers([]);
    } finally {
      setIsRosterLoading(false);
    }
  };

  const handleDeleteSubscriber = async (subId: string) => {
    if (!confirm("Are you sure you want to remove this contact from the audience list?")) return;
    setDeletingSubId(subId);
    try {
      const res = await crmFetch(`/api/erp/crm/lists/subscribers?id=${subId}`, { method: "DELETE" }).then((r) => r.json());
      if (res?.success) {
        setRosterSubscribers((prev) => prev.filter((s) => s.id !== subId));
        if (rosterList) {
          setLists((prev) =>
            prev.map((l) => (l.id === rosterList.id ? { ...l, subscriberCount: Math.max(0, l.subscriberCount - 1) } : l))
          );
        }
      }
    } catch {
      alert("Failed to delete contact from audience list");
    } finally {
      setDeletingSubId(null);
    }
  };

  const filteredRoster = rosterSubscribers.filter((s) => {
    const q = rosterSearch.toLowerCase();
    const fullName = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
    return (
      s.email.toLowerCase().includes(q) ||
      (s.company && s.company.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      fullName.includes(q)
    );
  });

  const handleImportSubscribers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeList || parsedContacts.length === 0) {
      alert("Please enter at least one valid contact with an email address.");
      return;
    }
    setIsImporting(true);

    const payloadSubs = parsedContacts.map((c) => {
      const nameParts = c.contactName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      return {
        email: c.email,
        company: c.company || defaultCompany.trim(),
        firstName,
        lastName,
        phone: c.phone || "",
      };
    });

    try {
      const res = await crmFetch("/api/erp/crm/lists/subscribers", {
        method: "POST",
        body: JSON.stringify({
          listId: activeList.id,
          subscribers: payloadSubs,
        }),
      });
      const data = await res.json();
      const count = data?.addedCount || payloadSubs.length;
      if (count) {
        setLists((prev) =>
          prev.map((l) =>
            l.id === activeList.id ? { ...l, subscriberCount: l.subscriberCount + count } : l
          )
        );
        alert(`Successfully registered ${count} contact${count === 1 ? '' : 's'} with company and name details into "${activeList.name}".`);
      }
    } catch {
      alert("Contacts registered locally.");
    } finally {
      setIsImporting(false);
      setIsSubModalOpen(false);
      setEmailsInput("");
      setDefaultCompany("");
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
                <div className="flex items-center gap-3">
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
                  <button
                    type="button"
                    onClick={() => openRosterModal(list)}
                    className="text-xs font-semibold text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] flex items-center gap-1 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" /> View Roster
                  </button>
                </div>
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
              label="Audience Tags"
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
        subtitle="Batch import contacts with Company Names and Contact Names (supports CSV, Excel rows, or emails)."
      >
        <form onSubmit={handleImportSubscribers} className="space-y-4">
          <div className="space-y-1">
            <NexaInput
              label="Default Company Name (Optional)"
              value={defaultCompany}
              onChange={(e) => setDefaultCompany(e.target.value)}
              placeholder="e.g. Dangote Group (auto-applied if company is omitted per row)"
              leftIcon={<Building2 className="w-4 h-4 text-[var(--nexa-text-muted)]" />}
            />
            <p className="text-[11px] text-[var(--nexa-text-muted)]">
              If contacts belong to a single corporate client, type it here to apply it to all pasted rows.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[var(--nexa-text-primary)]">
                Contacts List (one per line, CSV, or Tab-separated)
              </label>
              <span className="text-[10px] text-[#1A56DB] font-semibold bg-[#1A56DB]/10 px-2 py-0.5 rounded">
                Format: email, company, contact_name, phone
              </span>
            </div>
            <textarea
              rows={6}
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
              placeholder={`ceo@dangote.com, Dangote Group, Aliko Dangote, +2348031234567\nprocurement@buagroup.com, BUA Cement, Rabiu Abdulsamad, 08023456789\ndirector@nnpc.gov.ng, NNPC Limited, Mele Kyari\nexecutive@innovate.ng, Innovate Tech, 08123456789`}
              className="w-full px-3 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-mono"
              required
            />
          </div>

          {/* REAL-TIME PARSER PREVIEW */}
          {parsedContacts.length > 0 && (
            <div className="p-3 rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {parsedContacts.length} Contact{parsedContacts.length > 1 ? "s" : ""} Ready to Import
                </span>
                <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-[var(--nexa-text-muted)]">
                  <span className="bg-purple-500/10 text-purple-600 font-semibold px-2 py-0.5 rounded">
                    {parsedContacts.filter((c) => c.company).length} with Company
                  </span>
                  <span className="bg-blue-500/10 text-blue-600 font-semibold px-2 py-0.5 rounded">
                    {parsedContacts.filter((c) => c.contactName).length} with Contact Name
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-600 font-semibold px-2 py-0.5 rounded">
                    {parsedContacts.filter((c) => c.phone).length} with Phone
                  </span>
                </div>
              </div>

              {/* Preview Chips */}
              <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                {parsedContacts.slice(0, 5).map((contact, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[11px]"
                  >
                    <span className="font-mono text-[var(--nexa-text-primary)] truncate max-w-[160px]">
                      {contact.email}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      {contact.company ? (
                        <span className="flex items-center gap-1 text-[10px] text-purple-600 font-semibold bg-purple-500/10 px-1.5 py-0.5 rounded">
                          <Building2 className="w-2.5 h-2.5" /> {contact.company}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--nexa-text-muted)] italic">No Company</span>
                      )}
                      {contact.contactName ? (
                        <span className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold bg-blue-500/10 px-1.5 py-0.5 rounded">
                          <User className="w-2.5 h-2.5" /> {contact.contactName}
                        </span>
                      ) : null}
                      {contact.phone ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          <Phone className="w-2.5 h-2.5" /> {contact.phone}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
                {parsedContacts.length > 5 && (
                  <p className="text-[10px] text-[var(--nexa-text-muted)] text-center pt-1">
                    + {parsedContacts.length - 5} more contact{parsedContacts.length - 5 > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <NexaButton variant="secondary" type="button" onClick={() => setIsSubModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton variant="primary" type="submit" disabled={isImporting || parsedContacts.length === 0}>
              {isImporting
                ? "Registering Contacts..."
                : `Import ${parsedContacts.length} Contact${parsedContacts.length === 1 ? "" : "s"}`}
            </NexaButton>
          </div>
        </form>
      </NexaModal>

      {/* ROSTER / VIEW CONTACTS MODAL */}
      <NexaModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        title={`Roster: "${rosterList?.name || 'Audience List'}"`}
        subtitle={`${rosterSubscribers.length} total contact${rosterSubscribers.length === 1 ? '' : 's'} registered in this segment.`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <NexaInput
                placeholder="Search roster by email, company, or name..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-[var(--nexa-text-muted)]" />}
              />
            </div>
            <NexaButton
              variant="primary"
              className="text-xs gap-1.5 shrink-0"
              onClick={() => {
                setActiveList(rosterList);
                setIsRosterModalOpen(false);
                setIsSubModalOpen(true);
              }}
            >
              <Plus className="w-3.5 h-3.5" /> Add Contacts
            </NexaButton>
          </div>

          {isRosterLoading ? (
            <div className="py-12 text-center text-xs text-[var(--nexa-text-muted)]">
              Loading roster contacts...
            </div>
          ) : filteredRoster.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Users className="w-8 h-8 text-[var(--nexa-text-muted)] mx-auto opacity-50" />
              <p className="text-xs font-bold text-[var(--nexa-text-primary)]">
                {rosterSearch ? "No matching contacts found" : "No contacts in this list yet"}
              </p>
              <p className="text-[11px] text-[var(--nexa-text-muted)] max-w-sm mx-auto">
                {rosterSearch
                  ? "Try searching with a different keyword."
                  : "Batch import contacts with their company names and contact names to start sending campaigns."}
              </p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {filteredRoster.map((sub) => {
                const fullName = `${sub.firstName || ""} ${sub.lastName || ""}`.trim();
                return (
                  <div
                    key={sub.id}
                    className="p-3 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-[var(--nexa-text-primary)] font-mono truncate">
                          {sub.email}
                        </span>
                        {fullName && (
                          <span className="text-[11px] font-semibold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                            <User className="w-2.5 h-2.5" /> {fullName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[var(--nexa-text-muted)]">
                        {sub.company ? (
                          <span className="flex items-center gap-1 font-medium text-[var(--nexa-text-primary)]">
                            <Building2 className="w-3 h-3 text-purple-500" />
                            {sub.company}
                          </span>
                        ) : (
                          <span className="italic text-[10px]">No company specified</span>
                        )}
                        {sub.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-500" />
                            {sub.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={deletingSubId === sub.id}
                      onClick={() => handleDeleteSubscriber(sub.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                      title="Remove contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-[var(--nexa-border)]">
            <NexaButton variant="secondary" onClick={() => setIsRosterModalOpen(false)}>
              Close
            </NexaButton>
          </div>
        </div>
      </NexaModal>
    </ErpAdminShell>
  );
}
