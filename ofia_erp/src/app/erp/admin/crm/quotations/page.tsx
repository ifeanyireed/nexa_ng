"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Printer,
  TrendingUp,
  Building2,
  Trash2,
  RefreshCw,
  XCircle,
  AlertCircle,
  Eye,
  FileCheck,
  Percent,
  SlidersHorizontal,
  Package,
  Truck,
  Calendar,
  GraduationCap,
  Repeat,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";
import { Pagination } from "@/components/nexa/Pagination";
import { CrmQuotation, QuotationLineItem, QuotationColumnTitles, QuotationStatus, CrmDeal, CrmLead } from "@/lib/crm-service";
import { crmFetch } from "@/lib/crm-client";
import { useActiveTenant } from "@/lib/tenant-context";
import { downloadQuotationPdf } from "@/lib/quotation-pdf";

export default function QuotationsPage() {
  const { activeTenant } = useActiveTenant();

  const tenantDisplayName =
    activeTenant?.name ||
    (typeof window !== "undefined"
      ? localStorage.getItem("nexa_tenant_name") || localStorage.getItem("tenant_name")
      : "") ||
    "Ofia Enterprise";

  const tenantDisplayLogo =
    activeTenant?.logo ||
    (typeof window !== "undefined"
      ? localStorage.getItem("nexa_tenant_logo") || localStorage.getItem("tenant_logo")
      : "") ||
    "/icon.png";

  const [quotations, setQuotations] = useState<CrmQuotation[]>([]);
  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal 1: New Quotation
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [title, setTitle] = useState("");
  const [senderUrl, setSenderUrl] = useState<string>("");
  const [senderEmail, setSenderEmail] = useState<string>("");
  const [companyName, setCompanyName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [validityDays, setValidityDays] = useState(30);
  const [vatRate, setVatRate] = useState<number>(7.5); // Decision 2: Configurable VAT%
  const [paymentTerms, setPaymentTerms] = useState("70% Mobilization Deposit, 30% upon Delivery / Signoff");
  const [notes, setNotes] = useState("This quotation is subject to technical confirmation and site readiness. Bank transfer details provided upon invoice.");

  // Configurable Column Titles in Proposal Builder
  const [columnTitles, setColumnTitles] = useState<QuotationColumnTitles>({
    description: "Item Description",
    secondary: "",
    additionalText: "",
    quantity: "Qty",
    unitPrice: "Unit Price",
    amount: "Total (NGN)",
  });
  const [isConfiguringColumns, setIsConfiguringColumns] = useState(false);

  // Column active checks
  const hasSecondaryCol = Boolean(columnTitles.secondary && columnTitles.secondary.trim().length > 0);
  const hasAdditionalTextCol = Boolean(columnTitles.additionalText && columnTitles.additionalText.trim().length > 0);

  const COLUMN_PRESETS: { label: string; icon: React.ReactNode; titles: QuotationColumnTitles }[] = [
    {
      label: "Standard Items",
      icon: <Package className="w-3.5 h-3.5" />,
      titles: { description: "Item Description", secondary: "", additionalText: "", quantity: "Qty", unitPrice: "Unit Price", amount: "Total (NGN)" },
    },
    {
      label: "Transportation",
      icon: <Truck className="w-3.5 h-3.5" />,
      titles: { description: "Routes", secondary: "Distance (KM)", additionalText: "Vehicle / Cargo Details", quantity: "Trips", unitPrice: "Rate", amount: "Total" },
    },
    {
      label: "Services & Hours",
      icon: <Clock className="w-3.5 h-3.5" />,
      titles: { description: "Scope of Work / Deliverable", secondary: "", additionalText: "Specifications / Milestones", quantity: "Hours", unitPrice: "Hourly Rate", amount: "Total (NGN)" },
    },
    {
      label: "Consulting & Days",
      icon: <Calendar className="w-3.5 h-3.5" />,
      titles: { description: "Milestone / Deliverable", secondary: "", additionalText: "Lead Consultant / Role", quantity: "Days", unitPrice: "Daily Rate", amount: "Total (NGN)" },
    },
    {
      label: "Training & Academy",
      icon: <GraduationCap className="w-3.5 h-3.5" />,
      titles: { description: "Course / Training Module", secondary: "", additionalText: "Target Audience / Level", quantity: "Participants / Seats", unitPrice: "Tuition per Seat", amount: "Total (NGN)" },
    },
    {
      label: "Retainer & Coverage",
      icon: <Repeat className="w-3.5 h-3.5" />,
      titles: { description: "Service Plan / Coverage", secondary: "", additionalText: "SLA / Support Window", quantity: "Duration (Months)", unitPrice: "Monthly Fee", amount: "Total (NGN)" },
    },
  ];

  // Line Items in Builder
  const [lineItems, setLineItems] = useState<QuotationLineItem[]>([
    {
      id: "item-1",
      description: "Ofia ERP Enterprise Solution Deployment & Training",
      quantity: 1,
      unitPrice: 2500000,
      discountPercent: 0,
      taxPercent: 7.5,
      amount: 2500000,
    },
  ]);

  // Modal 2: Preview Document
  const [previewQuote, setPreviewQuote] = useState<CrmQuotation | null>(null);
  const [isPreviewingDraft, setIsPreviewingDraft] = useState(false);

  // Status Action Loader
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [quotesRes, dealsRes, leadsRes] = await Promise.all([
        crmFetch("/api/erp/crm/quotations").then((r) => r.json()).catch(() => null),
        crmFetch("/api/erp/crm/deals").then((r) => r.json()).catch(() => null),
        crmFetch("/api/erp/crm/leads").then((r) => r.json()).catch(() => null),
      ]);

      if (quotesRes?.quotations) setQuotations(quotesRes.quotations);
      else setQuotations([]);

      if (dealsRes?.deals) setDeals(dealsRes.deals);
      else setDeals([]);

      if (leadsRes?.leads) setLeads(leadsRes.leads);
      else setLeads([]);
    } catch (err) {
      console.warn("Failed to load quotations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync letterhead URL and contact email with active tenant defaults
  useEffect(() => {
    if (!senderUrl && activeTenant?.domain) {
      setSenderUrl(activeTenant.domain);
    } else if (!senderUrl) {
      setSenderUrl("www.ofia.ng");
    }
    if (!senderEmail && activeTenant?.ownerEmail) {
      setSenderEmail(activeTenant.ownerEmail);
    } else if (!senderEmail) {
      setSenderEmail("support@ofia.ng");
    }
  }, [activeTenant, senderUrl, senderEmail]);

  // Handle auto-populating client info when a deal is chosen
  const handleDealSelect = (dealId: string) => {
    setSelectedDealId(dealId);
    if (!dealId) return;
    const deal = deals.find((d) => d.id === dealId);
    if (deal) {
      setCompanyName(deal.company || "");
      setClientName(deal.contactName || "");
      setClientEmail(deal.email || "");
      setClientPhone(deal.phone || "");
      setTitle(`Quotation: ${deal.title}`);
    }
  };

  // Handle auto-populating client info when a lead is chosen
  const handleLeadSelect = (leadId: string) => {
    setSelectedLeadId(leadId);
    if (!leadId) return;
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setCompanyName(lead.companyName || "");
      setClientName(lead.contactName || "");
      setClientEmail(lead.contactEmail || "");
      setClientPhone(lead.contactPhone || "");
      setTitle(`Proposal: Commercial Quote for ${lead.companyName}`);
    }
  };

  // Line item handlers
  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: "",
        additionalText: "",
        distance: hasSecondaryCol ? 1 : undefined,
        detail: hasSecondaryCol ? "1" : "",
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        taxPercent: vatRate,
        amount: 0,
      },
    ]);
  };

  const handleUpdateLineItem = (id: string, field: keyof QuotationLineItem, value: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "distance") {
          const parsed = typeof value === "number" ? value : parseInt(String(value), 10);
          updated.distance = isNaN(parsed) ? 0 : parsed;
          updated.detail = String(updated.distance);
        } else if (field === "detail") {
          const num = parseInt(String(value), 10);
          if (!isNaN(num)) {
            updated.distance = num;
            updated.detail = String(num);
          } else {
            updated.detail = String(value);
          }
        }

        const qty = Number(updated.quantity || 0);
        const price = Number(updated.unitPrice || 0);
        const discount = Number(updated.discountPercent || 0);
        const netPrice = price * (1 - discount / 100);

        // When secondary column is active (Transportation template: Distance (KM)),
        // Distance is an integer multiplier:
        // Total = Distance (KM) * Trips * Rate * (1 - discount/100)
        const hasSecondary = Boolean(columnTitles.secondary && columnTitles.secondary.trim() !== "");
        const distMultiplier = hasSecondary
          ? (updated.distance !== undefined && updated.distance !== null
              ? Number(updated.distance)
              : (parseInt(String(updated.detail || "0"), 10) || 0))
          : 1;

        updated.amount = Math.max(0, distMultiplier * qty * netPrice);
        return updated;
      })
    );
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Synchronize item amounts whenever secondary multiplier column is changed or toggled
  useEffect(() => {
    setLineItems((prev) =>
      prev.map((item) => {
        const hasSecondary = Boolean(columnTitles.secondary && columnTitles.secondary.trim() !== "");
        const distMultiplier = hasSecondary
          ? (item.distance !== undefined && item.distance !== null
              ? Number(item.distance)
              : (parseInt(String(item.detail || "1"), 10) || 1))
          : 1;
        const qty = Number(item.quantity || 0);
        const price = Number(item.unitPrice || 0);
        const discount = Number(item.discountPercent || 0);
        const netPrice = price * (1 - discount / 100);
        return {
          ...item,
          distance: hasSecondary ? (item.distance !== undefined ? item.distance : (parseInt(item.detail || "1", 10) || 1)) : undefined,
          detail: hasSecondary ? String(item.distance ?? item.detail ?? 1) : item.detail,
          amount: Math.max(0, distMultiplier * qty * netPrice),
        };
      })
    );
  }, [columnTitles.secondary]);

  // Live financial calculations
  const calculatedSubtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => {
      const distMultiplier = hasSecondaryCol
        ? (item.distance !== undefined && item.distance !== null
            ? Number(item.distance)
            : (parseInt(String(item.detail || "0"), 10) || 0))
        : 1;
      const qty = Number(item.quantity || 0);
      const price = Number(item.unitPrice || 0);
      return sum + distMultiplier * qty * price;
    }, 0);
  }, [lineItems, hasSecondaryCol]);

  const calculatedDiscountTotal = useMemo(() => {
    return lineItems.reduce((sum, item) => {
      const distMultiplier = hasSecondaryCol
        ? (item.distance !== undefined && item.distance !== null
            ? Number(item.distance)
            : (parseInt(String(item.detail || "0"), 10) || 0))
        : 1;
      const gross = distMultiplier * Number(item.quantity || 0) * Number(item.unitPrice || 0);
      const discount = Number(item.discountPercent || 0);
      return sum + gross * (discount / 100);
    }, 0);
  }, [lineItems, hasSecondaryCol]);

  const calculatedTaxTotal = useMemo(() => {
    const net = calculatedSubtotal - calculatedDiscountTotal;
    return Math.max(0, net * (vatRate / 100));
  }, [calculatedSubtotal, calculatedDiscountTotal, vatRate]);

  const calculatedGrandTotal = useMemo(() => {
    return calculatedSubtotal - calculatedDiscountTotal + calculatedTaxTotal;
  }, [calculatedSubtotal, calculatedDiscountTotal, calculatedTaxTotal]);

  // Handle live proposal preview from modal draft
  const handlePreviewCurrentDraft = () => {
    const issueDate = new Date().toISOString().split("T")[0];
    const expiryDate = new Date(Date.now() + (Number(validityDays) || 30) * 86400000).toISOString().split("T")[0];

    const draftQuote: CrmQuotation = {
      id: "DRAFT-PREVIEW",
      tenantSlug: activeTenant?.slug || "default",
      currency: "NGN",
      quotationNumber: `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)} (DRAFT)`,
      title: title.trim() || (columnTitles.secondary ? "Commercial Transportation & Logistics Proposal" : "Commercial Quotation Proposal"),
      dealId: selectedDealId || undefined,
      leadId: selectedLeadId || undefined,
      companyName: companyName.trim() || "Prospective Client / Enterprise",
      clientName: clientName.trim() || "Designated Contact",
      clientEmail: clientEmail.trim() || "contact@clientcompany.com",
      clientPhone: clientPhone.trim() || "+234 800 000 0000",
      status: "DRAFT" as QuotationStatus,
      issueDate,
      expiryDate,
      lineItems: lineItems.length > 0 ? lineItems : [
        {
          id: "item-preview-1",
          description: columnTitles.secondary ? "Sample Logistics Route (Lagos - Abuja)" : "Quotation Line Item",
          additionalText: columnTitles.additionalText ? "30-Ton Flatbed Truck" : undefined,
          distance: columnTitles.secondary ? 750 : undefined,
          detail: columnTitles.secondary ? "750" : undefined,
          quantity: 1,
          unitPrice: 0,
          discountPercent: 0,
          taxPercent: vatRate,
          amount: 0,
        },
      ],
      subtotal: calculatedSubtotal,
      discountTotal: calculatedDiscountTotal,
      taxTotal: calculatedTaxTotal,
      vatRate: vatRate,
      totalAmount: calculatedGrandTotal,
      paymentTerms: paymentTerms || "Standard B2B Terms",
      notes: notes || "Quotation valid per stated clauses.",
      senderUrl: senderUrl.trim() || undefined,
      senderEmail: senderEmail.trim() || undefined,
      columnTitles: {
        ...columnTitles,
        senderUrl: senderUrl.trim() || undefined,
        senderEmail: senderEmail.trim() || undefined,
      },
      createdBy: activeTenant?.ownerName || "Current Sales Representative",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setIsPreviewingDraft(true);
    setPreviewQuote(draftQuote);
  };

  const handleClosePreview = () => {
    setPreviewQuote(null);
    setIsPreviewingDraft(false);
  };

  // Handle creating quote
  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !companyName.trim()) return;

    const issueDate = new Date().toISOString().split("T")[0];
    const expiryDate = new Date(Date.now() + validityDays * 86400000).toISOString().split("T")[0];

    const payload = {
      action: "CREATE",
      title: title.trim(),
      senderUrl: senderUrl.trim() || undefined,
      senderEmail: senderEmail.trim() || undefined,
      dealId: selectedDealId || undefined,
      leadId: selectedLeadId || undefined,
      companyName: companyName.trim(),
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      status: "DRAFT" as QuotationStatus,
      issueDate,
      expiryDate,
      currency: "NGN",
      vatRate,
      lineItems,
      columnTitles: {
        ...columnTitles,
        senderUrl: senderUrl.trim() || undefined,
        senderEmail: senderEmail.trim() || undefined,
      },
      subtotal: calculatedSubtotal,
      discountTotal: calculatedDiscountTotal,
      taxTotal: calculatedTaxTotal,
      totalAmount: calculatedGrandTotal,
      paymentTerms,
      notes,
      createdBy: activeTenant?.ownerName || "Commercial Sales Closer",
    };

    try {
      const res = await crmFetch("/api/erp/crm/quotations", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.quotation) {
        setQuotations((prev) => [data.quotation, ...prev]);
      }
    } catch (err) {
      console.warn("Failed to persist quotation:", err);
    }

    setIsCreateModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setSenderUrl(activeTenant?.domain || "www.ofia.ng");
    setSenderEmail(activeTenant?.ownerEmail || "support@ofia.ng");
    setSelectedDealId("");
    setSelectedLeadId("");
    setCompanyName("");
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setVatRate(7.5);
    setColumnTitles({
      description: "Item Description",
      quantity: "Qty",
      unitPrice: "Unit Price",
      amount: "Total (NGN)",
    });
    setIsConfiguringColumns(false);
    setLineItems([
      {
        id: "item-1",
        description: "",
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        taxPercent: 7.5,
        amount: 0,
      },
    ]);
  };

  // Status Actions
  const handleUpdateStatus = async (quote: CrmQuotation, newStatus: QuotationStatus) => {
    setActionInProgressId(quote.id);
    try {
      const res = await crmFetch("/api/erp/crm/quotations", {
        method: "POST",
        body: JSON.stringify({
          action: "UPDATE_STATUS",
          id: quote.id,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuotations((prev) =>
          prev.map((q) =>
            q.id === quote.id
              ? {
                  ...q,
                  status: newStatus,
                  acceptedAt: newStatus === "ACCEPTED" ? new Date().toISOString() : q.acceptedAt,
                  sentAt: newStatus === "SENT" ? new Date().toISOString() : q.sentAt,
                }
              : q
          )
        );
      }
    } catch (err) {
      console.warn("Status update error:", err);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDeleteQuotation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quotation proposal?")) return;
    try {
      await crmFetch("/api/erp/crm/quotations", {
        method: "POST",
        body: JSON.stringify({ action: "DELETE", id }),
      });
      setQuotations((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.warn("Delete error:", err);
    }
  };

  // Computed filtered list
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const matchesSearch =
        q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchQuery, statusFilter]);

  // Stats
  const totalValue = useMemo(() => quotations.reduce((acc, q) => acc + q.totalAmount, 0), [quotations]);
  const negotiatingCount = useMemo(() => quotations.filter((q) => q.status === "NEGOTIATING").length, [quotations]);
  const acceptedValue = useMemo(
    () => quotations.filter((q) => q.status === "ACCEPTED").reduce((acc, q) => acc + q.totalAmount, 0),
    [quotations]
  );
  const winRate = useMemo(() => {
    if (quotations.length === 0) return 0;
    const acceptedCount = quotations.filter((q) => q.status === "ACCEPTED").length;
    return Math.round((acceptedCount / quotations.length) * 100);
  }, [quotations]);

  const paginatedQuotes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuotations.slice(start, start + pageSize);
  }, [filteredQuotations, currentPage, pageSize]);

  return (
    <ErpAdminShell activeModule="crm">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[var(--nexa-text-primary)]">
                Quotations & Commercial Proposals
              </h1>
              <NexaBadge variant="secondary">CRM Deals</NexaBadge>
            </div>
            <p className="text-sm text-[var(--nexa-text-muted)] mt-1">
              Draft, negotiate, dispatch, and track itemized commercial quotes tied directly to pipeline leads and opportunities.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NexaButton variant="secondary" onClick={loadData} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </NexaButton>
            <NexaButton variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              New Quotation
            </NexaButton>
          </div>
        </div>

        {/* KPI STATS BAR */}
        <ErpStatGrid
          stats={[
            {
              label: "Pipeline Quotes Value",
              value: `₦${totalValue.toLocaleString()}`,
              change: `${quotations.length} total quotes issued`,
              changeType: "neutral",
              icon: <FileText className="w-5 h-5 text-indigo-500" />,
            },
            {
              label: "In Active Negotiation",
              value: `${negotiatingCount} Deals`,
              change: "Pending client approval",
              changeType: negotiatingCount > 0 ? "warning" : "neutral",
              icon: <Clock className="w-5 h-5 text-amber-500" />,
            },
            {
              label: "Accepted & Closed Won",
              value: `₦${acceptedValue.toLocaleString()}`,
              change: "Converted to contract revenue",
              changeType: "success",
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
            },
            {
              label: "Proposal Win Rate",
              value: `${winRate}%`,
              change: "Quotes accepted ratio",
              changeType: winRate >= 50 ? "success" : "neutral",
              icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
            },
          ]}
        />

        {/* SEARCH & FILTERS */}
        <NexaCard className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--nexa-text-muted)]" />
              <input
                type="text"
                placeholder="Search quote number, company, contact, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs text-[var(--nexa-text-primary)] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]"
              />
            </div>

            {/* STATUS FILTER TABS */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
              {["ALL", "DRAFT", "SENT", "NEGOTIATING", "ACCEPTED", "REJECTED"].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    statusFilter === st
                      ? "bg-[#1A56DB] text-white shadow-sm"
                      : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] border border-[var(--nexa-border)]"
                  }`}
                >
                  {st === "ALL" ? "All Quotes" : st}
                </button>
              ))}
            </div>
          </div>
        </NexaCard>

        {/* QUOTATIONS TABLE */}
        <NexaCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--nexa-text-primary)]">
              <thead className="bg-[var(--nexa-bg-base)] border-b border-[var(--nexa-border)] uppercase text-[10px] text-[var(--nexa-text-muted)] font-black">
                <tr>
                  <th className="py-3 px-4">Quote Ref</th>
                  <th className="py-3 px-4">Client & Company</th>
                  <th className="py-3 px-4">Commercial Subject</th>
                  <th className="py-3 px-4">Validity</th>
                  <th className="py-3 px-4">VAT%</th>
                  <th className="py-3 px-4">Total Amount (₦)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)]">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[var(--nexa-text-muted)]">
                      Loading commercial quotations...
                    </td>
                  </tr>
                ) : paginatedQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[var(--nexa-text-muted)]">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="font-bold">No quotations found</p>
                      <p className="text-[11px] mt-0.5">Create a proposal to start negotiating with leads.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedQuotes.map((q) => (
                    <tr key={q.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1A56DB]">
                        {q.quotationNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[var(--nexa-text-primary)]">{q.companyName}</div>
                        <div className="text-[10px] text-[var(--nexa-text-muted)]">{q.clientName || q.clientEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate">
                        <span className="font-semibold text-[var(--nexa-text-primary)]">{q.title}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px]">
                        <div>Issued: {q.issueDate}</div>
                        <div className="text-[10px] text-amber-500 font-medium">Expires: {q.expiryDate}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-400">
                        {q.vatRate}%
                      </td>
                      <td className="py-3.5 px-4 font-bold text-sm">
                        ₦{q.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            q.status === "ACCEPTED"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : q.status === "NEGOTIATING"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : q.status === "SENT"
                              ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                              : q.status === "REJECTED"
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                              : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* PREVIEW DOCUMENT */}
                          <button
                            onClick={() => {
                              setIsPreviewingDraft(false);
                              setPreviewQuote(q);
                            }}
                            title="Preview Official Quotation"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] hover:text-[#1A56DB] hover:border-[#1A56DB]/40 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#1A56DB]" />
                            <span>Preview</span>
                          </button>

                          {/* DOWNLOAD PDF */}
                          <button
                            onClick={() =>
                              downloadQuotationPdf(q, {
                                displayName: tenantDisplayName,
                                domain: q.senderUrl || q.columnTitles?.senderUrl || activeTenant?.domain,
                                ownerEmail: q.senderEmail || q.columnTitles?.senderEmail || activeTenant?.ownerEmail,
                                logo: tenantDisplayLogo,
                              })
                            }
                            title="Download Official Quotation PDF"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] hover:text-emerald-600 hover:border-emerald-500/40 transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-600" />
                            <span>PDF</span>
                          </button>

                          {/* PRINT QUOTATION */}
                          <button
                            onClick={() =>
                              downloadQuotationPdf(q, {
                                displayName: tenantDisplayName,
                                domain: q.senderUrl || q.columnTitles?.senderUrl || activeTenant?.domain,
                                ownerEmail: q.senderEmail || q.columnTitles?.senderEmail || activeTenant?.ownerEmail,
                                logo: tenantDisplayLogo,
                              })
                            }
                            title="Print Official Quotation"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] hover:text-slate-800 hover:border-slate-400/40 transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                            <span>Print</span>
                          </button>

                          {/* SEND QUOTE */}
                          {q.status === "DRAFT" && (
                            <button
                              onClick={() => handleUpdateStatus(q, "SENT")}
                              disabled={actionInProgressId === q.id}
                              title="Mark as Sent to Lead"
                              className="p-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* IN NEGOTIATION */}
                          {q.status === "SENT" && (
                            <button
                              onClick={() => handleUpdateStatus(q, "NEGOTIATING")}
                              disabled={actionInProgressId === q.id}
                              title="Mark as In Negotiation"
                              className="p-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* ACCEPT & WON */}
                          {(q.status === "SENT" || q.status === "NEGOTIATING" || q.status === "DRAFT") && (
                            <button
                              onClick={() => handleUpdateStatus(q, "ACCEPTED")}
                              disabled={actionInProgressId === q.id}
                              title="Accept Quotation & Auto-Advance Deal to WON"
                              className="p-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* REJECT */}
                          {q.status !== "REJECTED" && q.status !== "ACCEPTED" && (
                            <button
                              onClick={() => handleUpdateStatus(q, "REJECTED")}
                              disabled={actionInProgressId === q.id}
                              title="Mark as Rejected"
                              className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* DELETE */}
                          <button
                            onClick={() => handleDeleteQuotation(q.id)}
                            title="Delete Quote"
                            className="p-1.5 rounded-lg border border-transparent text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-[var(--nexa-border)]">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredQuotations.length / pageSize) || 1}
              onPageChange={setCurrentPage}
            />
          </div>
        </NexaCard>

        {/* MODAL 1: NEW COMMERCIAL QUOTATION BUILDER */}
        <NexaModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Commercial Quotation Proposal"
          subtitle="Generate itemized quotations for leads and negotiations with automatic deal synchronization."
          maxWidth="800px"
          className="max-w-[800px] !max-w-[800px] w-full"
        >
          <form onSubmit={handleCreateQuotation} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            {/* LINK DEAL OR LEAD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                  Link to Existing Pipeline Deal (Optional)
                </label>
                <select
                  value={selectedDealId}
                  onChange={(e) => handleDealSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs text-[var(--nexa-text-primary)]"
                >
                  <option value="">-- Standalone Proposal / Select Deal --</option>
                  {deals.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.company})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                  Or Link to CRM Lead (Optional)
                </label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => handleLeadSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs text-[var(--nexa-text-primary)]"
                >
                  <option value="">-- Select Contact Lead --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.companyName} - {l.contactName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* QUOTATION TITLE */}
            <NexaInput
              label="Proposal / Quotation Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 100-Seat CBT Lab Setup & ResultsPro Infrastructure"
              required
            />

            {/* CONFIGURABLE URL & CONTACT EMAIL UNDER TITLE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NexaInput
                label="Website Url"
                value={senderUrl}
                onChange={(e) => setSenderUrl(e.target.value)}
                placeholder="e.g. www.ofia.ng or www.yourcompany.com"
              />
              <NexaInput
                label="Contact Email"
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="e.g. support@ofia.ng or info@yourcompany.com"
              />
            </div>

            {/* CLIENT DETAILS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NexaInput
                label="Company / Institutional Client"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Lekki Free Zone Development"
                required
              />
              <NexaInput
                label="Contact Person Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Engr. Femi Adeleke"
              />
              <NexaInput
                label="Client Email"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="f.adeleke@lfz.ng"
              />
              <NexaInput
                label="Client Phone Number"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+234 803 000 0000"
              />
            </div>

            {/* VALIDITY & CONFIGURABLE VAT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                  Quotation Validity Window
                </label>
                <select
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs text-[var(--nexa-text-primary)]"
                >
                  <option value={7}>7 Calendar Days</option>
                  <option value={14}>14 Calendar Days</option>
                  <option value={30}>30 Calendar Days (Standard)</option>
                  <option value={60}>60 Calendar Days</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                  Configurable Statutory VAT% (Decision 2)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={vatRate}
                    onChange={(e) => setVatRate(Number(e.target.value))}
                    className="w-full pr-8 pl-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs text-[var(--nexa-text-primary)] font-bold"
                  />
                  <Percent className="w-3.5 h-3.5 absolute right-3 top-3 text-[var(--nexa-text-muted)]" />
                </div>
                <p className="text-[10px] text-[var(--nexa-text-muted)] mt-0.5">
                  Default 7.5% Nigerian VAT. Set to 0% for tax-exempt services.
                </p>
              </div>
            </div>

            {/* LINE ITEMS BUILDER */}
            {(() => {
              const hasSecondaryCol = Boolean(columnTitles.secondary && columnTitles.secondary.trim().length > 0);
              return (
                <div className="border border-[var(--nexa-border)] rounded-xl p-3 bg-[var(--nexa-bg-base)] space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-[var(--nexa-text-primary)]">
                        Itemized Quotation Lines
                      </span>
                      <span className="text-[10px] text-[var(--nexa-text-muted)] bg-[var(--nexa-bg-surface)] px-2 py-0.5 rounded-full border border-[var(--nexa-border)] font-mono">
                        {lineItems.length} {lineItems.length === 1 ? "line" : "lines"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsConfiguringColumns(!isConfiguringColumns)}
                        className={`text-xs font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          isConfiguringColumns
                            ? "bg-[#1A56DB] text-white border-[#1A56DB] shadow-xs"
                            : "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-secondary)] border-[var(--nexa-border)] hover:text-[#1A56DB] hover:border-[#1A56DB]/40"
                        }`}
                        title="Customize the table column titles for this proposal"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>{isConfiguringColumns ? "Hide Column Settings" : "Configure Column Titles"}</span>
                      </button>
                      <NexaButton type="button" variant="secondary" size="sm" onClick={handleAddLineItem}>
                        <Plus className="w-3 h-3 mr-1" /> Add Line
                      </NexaButton>
                    </div>
                  </div>

                  {/* CONFIGURABLE COLUMN TITLES PANEL */}
                  {isConfiguringColumns && (
                    <div className="p-3 rounded-xl border border-[#1A56DB]/30 bg-[#1A56DB]/5 space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-[#1A56DB]" />
                          Customize Table Column Titles:
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setColumnTitles({
                              description: "Item Description",
                              secondary: "",
                              quantity: "Qty",
                              unitPrice: "Unit Price",
                              amount: "Total (NGN)",
                            })
                          }
                          className="text-[11px] font-medium text-slate-500 hover:text-rose-500 underline cursor-pointer"
                        >
                          Reset to Defaults
                        </button>
                      </div>

                      {/* Industry Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider mr-1">
                          Quick Presets:
                        </span>
                        {COLUMN_PRESETS.map((p) => {
                          const isActive =
                            columnTitles.description === p.titles.description &&
                            (columnTitles.secondary || "") === (p.titles.secondary || "") &&
                            (columnTitles.additionalText || "") === (p.titles.additionalText || "") &&
                            columnTitles.quantity === p.titles.quantity &&
                            columnTitles.unitPrice === p.titles.unitPrice &&
                            columnTitles.amount === p.titles.amount;
                          return (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => {
                                setColumnTitles({ ...p.titles });
                                if (p.label === "Transportation") {
                                  setLineItems((prev) =>
                                    prev.map((item) => {
                                      const isGenericDefault = item.description === "Ofia ERP Enterprise Solution Deployment & Training" || !item.description;
                                      const dist = item.distance && item.distance > 0 ? item.distance : (parseInt(String(item.detail || ""), 10) || 750);
                                      const trips = item.quantity > 0 ? item.quantity : 2;
                                      const rate = item.unitPrice > 0 ? item.unitPrice : 1500;
                                      return {
                                        ...item,
                                        description: isGenericDefault ? "Lagos (Apapa) – Abuja Industrial Hub" : item.description,
                                        additionalText: item.additionalText || "30-Ton Flatbed Truck",
                                        distance: dist,
                                        detail: String(dist),
                                        quantity: trips,
                                        unitPrice: rate,
                                        amount: dist * trips * rate,
                                      };
                                    })
                                  );
                                }
                              }}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors cursor-pointer flex items-center gap-1 ${
                                isActive
                                  ? "bg-[#1A56DB] text-white border-[#1A56DB]"
                                  : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border-[var(--nexa-border)] hover:border-[#1A56DB]/50 hover:text-[var(--nexa-text-primary)]"
                              }`}
                            >
                              <span>{p.icon}</span>
                              <span>{p.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* 6 Editable Column Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 pt-1">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-[var(--nexa-text-muted)] mb-1">
                            Col 1 (Description)
                          </label>
                          <input
                            type="text"
                            value={columnTitles.description}
                            onChange={(e) => setColumnTitles((prev) => ({ ...prev, description: e.target.value }))}
                            className="w-full px-2.5 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-semibold text-[var(--nexa-text-primary)] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]"
                            placeholder="Routes / Description"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-[#1A56DB] mb-1">
                            Col 2 (Additional Text)
                          </label>
                          <input
                            type="text"
                            value={columnTitles.additionalText || ""}
                            onChange={(e) => setColumnTitles((prev) => ({ ...prev, additionalText: e.target.value }))}
                            className="w-full px-2.5 py-1.5 bg-[var(--nexa-bg-base)] border border-[#1A56DB]/40 rounded-lg text-xs font-semibold text-[var(--nexa-text-primary)] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]"
                            placeholder="Vehicle / Notes (Optional)"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-[var(--nexa-text-muted)] mb-1">
                            Col 3 (Distance / Multiplier)
                          </label>
                          <input
                            type="text"
                            value={columnTitles.secondary || ""}
                            onChange={(e) => setColumnTitles((prev) => ({ ...prev, secondary: e.target.value }))}
                            className="w-full px-2.5 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-semibold text-[var(--nexa-text-primary)] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]"
                            placeholder="Distance (KM) (Optional)"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-[var(--nexa-text-muted)] mb-1">
                            Col 4 (Trips / Qty)
                          </label>
                          <input
                            type="text"
                            value={columnTitles.quantity}
                            onChange={(e) => setColumnTitles((prev) => ({ ...prev, quantity: e.target.value }))}
                            className="w-full px-2.5 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-semibold text-[var(--nexa-text-primary)] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]"
                            placeholder="Trips / Qty"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-[var(--nexa-text-muted)] mb-1">
                            Col 5 (Rate / Price)
                          </label>
                          <input
                            type="text"
                            value={columnTitles.unitPrice}
                            onChange={(e) => setColumnTitles((prev) => ({ ...prev, unitPrice: e.target.value }))}
                            className="w-full px-2.5 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-semibold text-[var(--nexa-text-primary)] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]"
                            placeholder="Rate / Price"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-[var(--nexa-text-muted)] mb-1">
                            Col 6 (Total)
                          </label>
                          <input
                            type="text"
                            value={columnTitles.amount}
                            onChange={(e) => setColumnTitles((prev) => ({ ...prev, amount: e.target.value }))}
                            className="w-full px-2.5 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-semibold text-[var(--nexa-text-primary)] focus:outline-none focus:ring-1 focus:ring-[#1A56DB]"
                            placeholder="Total"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TABLE COLUMN HEADER ROW */}
                  {hasSecondaryCol && hasAdditionalTextCol ? (
                    <div className="grid grid-cols-12 gap-2 items-center px-2 py-1 bg-[var(--nexa-bg-surface)] rounded-lg text-[10px] font-black uppercase text-[var(--nexa-text-muted)] tracking-wider">
                      <div className="col-span-3">{columnTitles.description || "Routes"}</div>
                      <div className="col-span-2">{columnTitles.additionalText || "Vehicle / Spec"}</div>
                      <div className="col-span-2 text-center">{columnTitles.secondary || "Distance (KM)"}</div>
                      <div className="col-span-1 text-center">{columnTitles.quantity || "Trips"}</div>
                      <div className="col-span-2 text-right">{columnTitles.unitPrice || "Rate"}</div>
                      <div className="col-span-1 text-right">{columnTitles.amount || "Total"}</div>
                      <div className="col-span-1" />
                    </div>
                  ) : hasSecondaryCol ? (
                    <div className="grid grid-cols-12 gap-2 items-center px-2 py-1 bg-[var(--nexa-bg-surface)] rounded-lg text-[10px] font-black uppercase text-[var(--nexa-text-muted)] tracking-wider">
                      <div className="col-span-3">{columnTitles.description || "Routes"}</div>
                      <div className="col-span-2 text-center">{columnTitles.secondary || "Distance (KM)"}</div>
                      <div className="col-span-2 text-center">{columnTitles.quantity || "Trips"}</div>
                      <div className="col-span-2 text-center">{columnTitles.unitPrice || "Rate"}</div>
                      <div className="col-span-2 text-right">{columnTitles.amount || "Total"}</div>
                      <div className="col-span-1" />
                    </div>
                  ) : hasAdditionalTextCol ? (
                    <div className="grid grid-cols-12 gap-2 items-center px-2 py-1 bg-[var(--nexa-bg-surface)] rounded-lg text-[10px] font-black uppercase text-[var(--nexa-text-muted)] tracking-wider">
                      <div className="col-span-4">{columnTitles.description || "Item Description"}</div>
                      <div className="col-span-3">{columnTitles.additionalText || "Notes / Specification"}</div>
                      <div className="col-span-1 text-center">{columnTitles.quantity || "Qty"}</div>
                      <div className="col-span-2 text-right">{columnTitles.unitPrice || "Unit Price"}</div>
                      <div className="col-span-1 text-right">{columnTitles.amount || "Total"}</div>
                      <div className="col-span-1" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-12 gap-2 items-center px-2 py-1 bg-[var(--nexa-bg-surface)] rounded-lg text-[10px] font-black uppercase text-[var(--nexa-text-muted)] tracking-wider">
                      <div className="col-span-5">{columnTitles.description || "Item Description"}</div>
                      <div className="col-span-2 text-center">{columnTitles.quantity || "Qty"}</div>
                      <div className="col-span-2 text-center">{columnTitles.unitPrice || "Unit Price"}</div>
                      <div className="col-span-2 text-right">{columnTitles.amount || "Total (NGN)"}</div>
                      <div className="col-span-1" />
                    </div>
                  )}

                  <div className="space-y-2">
                    {lineItems.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-[var(--nexa-bg-card)] p-2 rounded-lg border border-[var(--nexa-border)] text-xs">
                        {hasSecondaryCol && hasAdditionalTextCol ? (
                          <>
                            <div className="col-span-3">
                              <input
                                type="text"
                                placeholder={columnTitles.description || "Route (e.g. Lagos - Abuja)"}
                                value={item.description}
                                onChange={(e) => handleUpdateLineItem(item.id, "description", e.target.value)}
                                className="w-full px-2 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="text"
                                placeholder={columnTitles.additionalText || "Vehicle / Cargo Details"}
                                value={item.additionalText || ""}
                                onChange={(e) => handleUpdateLineItem(item.id, "additionalText", e.target.value)}
                                className="w-full px-2 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs"
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                placeholder={columnTitles.secondary || "Distance (KM)"}
                                value={item.distance !== undefined && item.distance !== null ? (item.distance === 0 ? "" : item.distance) : (item.detail || "")}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const parsed = raw === "" ? 0 : parseInt(raw, 10);
                                  handleUpdateLineItem(item.id, "distance", isNaN(parsed) ? 0 : parsed);
                                }}
                                className="w-full px-2 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-semibold text-center"
                                required
                              />
                            </div>
                            <div className="col-span-1">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                placeholder={columnTitles.quantity || "Trips"}
                                value={item.quantity !== undefined && item.quantity !== null ? (item.quantity === 0 ? "" : item.quantity) : 1}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const parsed = raw === "" ? 0 : parseInt(raw, 10);
                                  handleUpdateLineItem(item.id, "quantity", isNaN(parsed) || parsed < 1 ? 1 : parsed);
                                }}
                                className="w-full px-2 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-semibold text-center"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                min="0"
                                placeholder={`${columnTitles.unitPrice || "Rate"} ₦`}
                                value={item.unitPrice !== undefined && item.unitPrice !== null ? (item.unitPrice === 0 ? "" : item.unitPrice) : ""}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const parsed = raw === "" ? 0 : Number(raw);
                                  handleUpdateLineItem(item.id, "unitPrice", isNaN(parsed) ? 0 : parsed);
                                }}
                                className="w-full px-2 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-semibold text-right"
                                required
                              />
                            </div>
                            <div className="col-span-1 font-mono font-bold text-right text-xs truncate">
                              ₦{item.amount.toLocaleString()}
                            </div>
                          </>
                        ) : hasSecondaryCol ? (
                          <>
                            <div className="col-span-3">
                              <input
                                type="text"
                                placeholder={columnTitles.description || "Route (e.g. Lagos - Abuja)"}
                                value={item.description}
                                onChange={(e) => handleUpdateLineItem(item.id, "description", e.target.value)}
                                className="w-full px-2 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                placeholder={columnTitles.secondary || "Distance (KM)"}
                                value={item.distance !== undefined && item.distance !== null ? (item.distance === 0 ? "" : item.distance) : (item.detail || "")}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const parsed = raw === "" ? 0 : parseInt(raw, 10);
                                  handleUpdateLineItem(item.id, "distance", isNaN(parsed) ? 0 : parsed);
                                }}
                                className="w-full px-2 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-semibold text-center"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                placeholder={columnTitles.quantity || "Trips"}
                                value={item.quantity !== undefined && item.quantity !== null ? (item.quantity === 0 ? "" : item.quantity) : 1}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const parsed = raw === "" ? 0 : parseInt(raw, 10);
                                  handleUpdateLineItem(item.id, "quantity", isNaN(parsed) || parsed < 1 ? 1 : parsed);
                                }}
                                className="w-full px-2 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-semibold text-center"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                min="0"
                                placeholder={`${columnTitles.unitPrice || "Rate"} ₦`}
                                value={item.unitPrice !== undefined && item.unitPrice !== null ? (item.unitPrice === 0 ? "" : item.unitPrice) : ""}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const parsed = raw === "" ? 0 : Number(raw);
                                  handleUpdateLineItem(item.id, "unitPrice", isNaN(parsed) ? 0 : parsed);
                                }}
                                className="w-full px-2 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-semibold text-right"
                                required
                              />
                            </div>
                            <div className="col-span-2 font-mono font-bold text-right text-xs">
                              ₦{item.amount.toLocaleString()}
                            </div>
                          </>
                        ) : hasAdditionalTextCol ? (
                          <>
                            <div className="col-span-4">
                              <input
                                type="text"
                                placeholder={columnTitles.description || "Product / Service Description"}
                                value={item.description}
                                onChange={(e) => handleUpdateLineItem(item.id, "description", e.target.value)}
                                className="w-full px-2 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs"
                                required
                              />
                            </div>
                            <div className="col-span-3">
                              <input
                                type="text"
                                placeholder={columnTitles.additionalText || "Specification / Deliverable Details"}
                                value={item.additionalText || ""}
                                onChange={(e) => handleUpdateLineItem(item.id, "additionalText", e.target.value)}
                                className="w-full px-2 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs"
                              />
                            </div>
                            <div className="col-span-1">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                placeholder={columnTitles.quantity || "Qty"}
                                value={item.quantity}
                                onChange={(e) => {
                                  const parsed = parseInt(e.target.value, 10);
                                  handleUpdateLineItem(item.id, "quantity", isNaN(parsed) || parsed < 1 ? 1 : parsed);
                                }}
                                className="w-full px-2 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-semibold text-center"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                min="0"
                                placeholder={`${columnTitles.unitPrice || "Unit Price"} ₦`}
                                value={item.unitPrice}
                                onChange={(e) => handleUpdateLineItem(item.id, "unitPrice", Number(e.target.value))}
                                className="w-full px-2 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-semibold text-right"
                                required
                              />
                            </div>
                            <div className="col-span-1 font-mono font-bold text-right text-xs truncate">
                              ₦{item.amount.toLocaleString()}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="col-span-5">
                              <input
                                type="text"
                                placeholder={columnTitles.description || "Product / Service Description"}
                                value={item.description}
                                onChange={(e) => handleUpdateLineItem(item.id, "description", e.target.value)}
                                className="w-full px-2 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                placeholder={columnTitles.quantity || "Qty"}
                                value={item.quantity}
                                onChange={(e) => {
                                  const parsed = parseInt(e.target.value, 10);
                                  handleUpdateLineItem(item.id, "quantity", isNaN(parsed) || parsed < 1 ? 1 : parsed);
                                }}
                                className="w-full px-2 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-semibold text-center"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                min="0"
                                placeholder={`${columnTitles.unitPrice || "Unit Price"} ₦`}
                                value={item.unitPrice}
                                onChange={(e) => handleUpdateLineItem(item.id, "unitPrice", Number(e.target.value))}
                                className="w-full px-2 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-semibold text-right"
                                required
                              />
                            </div>
                            <div className="col-span-2 font-mono font-bold text-right text-xs">
                              ₦{item.amount.toLocaleString()}
                            </div>
                          </>
                        )}
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(item.id)}
                            disabled={lineItems.length === 1}
                            className="text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                            title="Remove line"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* LIVE TOTALS COMPUTATION */}
                  <div className="pt-2 border-t border-[var(--nexa-border)] flex flex-col items-end space-y-1 text-xs font-semibold">
                    <div className="flex justify-between w-64 text-[var(--nexa-text-muted)]">
                      <span>Subtotal:</span>
                      <span>₦{calculatedSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between w-64 text-amber-500">
                      <span>VAT ({vatRate}%):</span>
                      <span>₦{calculatedTaxTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between w-64 text-base font-black text-[#1A56DB] pt-1 border-t border-[var(--nexa-border)]">
                      <span>Grand Total:</span>
                      <span>₦{calculatedGrandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* PAYMENT TERMS & NOTES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NexaInput
                label="Commercial Payment Terms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="e.g. 70% mobilization, 30% on delivery"
              />
              <NexaInput
                label="Proposal Notes and Bank Details"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bank instructions, validity clauses..."
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--nexa-border)]">
              <NexaButton
                type="button"
                variant="outline"
                onClick={handlePreviewCurrentDraft}
                className="flex items-center gap-1.5 border-[var(--nexa-border)] hover:border-[#1A56DB] hover:text-[#1A56DB]"
              >
                <Eye className="w-3.5 h-3.5 text-[#1A56DB]" />
                <span>Preview Quotation</span>
              </NexaButton>
              <div className="flex items-center gap-2">
                <NexaButton type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </NexaButton>
                <NexaButton type="submit" variant="primary">
                  Save & Issue Proposal
                </NexaButton>
              </div>
            </div>
          </form>
        </NexaModal>

        {/* MODAL 2: FORMAL PROPOSAL PREVIEW & PDF/PRINT */}
        {previewQuote && (
          <NexaModal
            isOpen={Boolean(previewQuote)}
            onClose={handleClosePreview}
            maxWidth="3xl"
            title={
              isPreviewingDraft ? (
                <div className="flex items-center gap-2">
                  <span>Proposal Live Preview</span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    Draft
                  </span>
                </div>
              ) : (
                `Formal Quotation: ${previewQuote.quotationNumber}`
              )
            }
            subtitle={
              isPreviewingDraft
                ? "Live interactive preview with your current line items, custom column headers, and calculations."
                : "Official branded proposal document ready for client dispatch or print export."
            }
          >
            <div className="space-y-6 text-xs max-h-[80vh] overflow-y-auto pr-1 p-2">
              {/* DRAFT PREVIEW ALERT BANNER */}
              {isPreviewingDraft && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-xs font-semibold">
                      Live Draft Preview: Reviewing proposal layout and column titles before saving.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClosePreview}
                    className="text-xs font-bold underline hover:no-underline text-amber-700 dark:text-amber-200 cursor-pointer"
                  >
                    Return to Editor
                  </button>
                </div>
              )}

              {/* PRINTABLE LETTERHEAD */}
              <div id="quotation-paper-area" className="border border-[var(--nexa-border)] p-6 rounded-2xl bg-white text-slate-900 space-y-6 shadow-sm">
                {/* HEADER */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    {tenantDisplayLogo ? (
                      <img
                        id="quotation-preview-logo"
                        crossOrigin="anonymous"
                        src={tenantDisplayLogo}
                        alt={tenantDisplayName}
                        className="w-12 h-12 object-contain rounded-xl p-1 bg-white border border-slate-200 shrink-0 shadow-xs"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : null}
                    <div>
                      <div className="text-xl font-black text-[#1A56DB] tracking-tight uppercase">
                        {tenantDisplayName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {previewQuote.senderUrl || previewQuote.columnTitles?.senderUrl || senderUrl || activeTenant?.domain || "Official Commercial & Operations Suite"}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {previewQuote.senderEmail || previewQuote.columnTitles?.senderEmail || senderEmail
                          ? `Contact: ${previewQuote.senderEmail || previewQuote.columnTitles?.senderEmail || senderEmail}`
                          : (activeTenant?.ownerEmail ? `Contact: ${activeTenant.ownerEmail}` : "Victoria Island / Ikeja Central Depot, Lagos, Nigeria")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg font-black text-xs uppercase tracking-wider">
                      COMMERCIAL QUOTATION
                    </span>
                    <div className="text-sm font-black text-slate-900 mt-2">{previewQuote.quotationNumber}</div>
                    <div className="text-[10px] text-slate-500">Date: {previewQuote.issueDate}</div>
                    <div className="text-[10px] text-rose-600 font-bold">Valid Until: {previewQuote.expiryDate}</div>
                  </div>
                </div>

                {/* CLIENT INFO */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-black text-slate-400">PROPOSAL PREPARED FOR:</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{previewQuote.companyName}</div>
                    <div className="text-slate-600">{previewQuote.clientName}</div>
                    <div className="text-slate-500">{previewQuote.clientEmail}</div>
                    <div className="text-slate-500">{previewQuote.clientPhone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-black text-slate-400">ENGAGEMENT TITLE:</div>
                    <div className="font-bold text-slate-900 mt-0.5">{previewQuote.title}</div>
                    <div className="text-slate-500 mt-1">Status: <span className="font-bold uppercase text-blue-600">{previewQuote.status}</span></div>
                    <div className="text-slate-500">Prepared By: {previewQuote.createdBy}</div>
                  </div>
                </div>

                {/* LINE ITEMS TABLE */}
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-[10px] uppercase font-black text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">{previewQuote.columnTitles?.description || "Item Description"}</th>
                      {previewQuote.columnTitles?.additionalText && (
                        <th className="py-2.5 px-3">{previewQuote.columnTitles.additionalText}</th>
                      )}
                      {previewQuote.columnTitles?.secondary && (
                        <th className="py-2.5 px-3 text-center">{previewQuote.columnTitles.secondary}</th>
                      )}
                      <th className="py-2.5 px-3 text-center">{previewQuote.columnTitles?.quantity || "Qty"}</th>
                      <th className="py-2.5 px-3 text-right">{previewQuote.columnTitles?.unitPrice || "Unit Price"}</th>
                      <th className="py-2.5 px-3 text-right">{previewQuote.columnTitles?.amount || "Total (NGN)"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewQuote.lineItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{item.description}</td>
                        {previewQuote.columnTitles?.additionalText && (
                          <td className="py-2.5 px-3 text-slate-600 font-normal">{item.additionalText || "—"}</td>
                        )}
                        {previewQuote.columnTitles?.secondary && (
                          <td className="py-2.5 px-3 font-mono font-bold text-center text-slate-700">
                            {item.distance !== undefined && item.distance !== null
                              ? item.distance.toLocaleString()
                              : item.detail || "1"}
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">₦{item.unitPrice.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">₦{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* FINANCIAL SUMMARY */}
                <div className="flex justify-end text-xs font-medium">
                  <div className="w-64 space-y-1.5 border-t border-slate-200 pt-2 text-slate-700">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-mono">₦{previewQuote.subtotal.toLocaleString()}</span>
                    </div>
                    {previewQuote.discountTotal > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Total Discounts:</span>
                        <span className="font-mono">-₦{previewQuote.discountTotal.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Statutory VAT ({previewQuote.vatRate}%):</span>
                      <span className="font-mono">₦{previewQuote.taxTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-300">
                      <span>Final Net Total:</span>
                      <span className="font-mono text-[#1A56DB]">₦{previewQuote.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* TERMS & BANKING */}
                <div className="border-t border-slate-200 pt-4 space-y-2 text-[11px] text-slate-600">
                  <div>
                    <span className="font-bold text-slate-800">Payment & Settlement Terms:</span> {previewQuote.paymentTerms}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">Proposal Notes and Bank Details:</span> {previewQuote.notes}
                  </div>
                </div>

                {/* SIGNATURE BLOCK */}
                <div className="border-t border-slate-200 pt-6 grid grid-cols-2 gap-8 text-[10px] text-slate-500">
                  <div>
                    <div className="border-b border-slate-400 w-48 mb-1.5 h-6"></div>
                    <p className="font-bold text-slate-700">Authorized Commercial Officer</p>
                    <p>{tenantDisplayName} Operations</p>
                  </div>
                  <div className="text-right">
                    <div className="border-b border-slate-400 w-48 mb-1.5 h-6 ml-auto"></div>
                    <p className="font-bold text-slate-700">Client Acceptance Signoff</p>
                    <p>{previewQuote.companyName}</p>
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="flex justify-between items-center pt-2">
                <div className="text-xs text-[var(--nexa-text-muted)]">
                  Status: <strong className="text-[var(--nexa-text-primary)]">{previewQuote.status}</strong>
                  {isPreviewingDraft && (
                    <span className="ml-2 text-[10px] text-amber-600 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Unsaved Draft
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <NexaButton
                    variant="secondary"
                    onClick={() => {
                      if (previewQuote) {
                        downloadQuotationPdf(previewQuote, {
                          displayName: tenantDisplayName,
                          domain: previewQuote.senderUrl || previewQuote.columnTitles?.senderUrl || senderUrl || activeTenant?.domain,
                          ownerEmail: previewQuote.senderEmail || previewQuote.columnTitles?.senderEmail || senderEmail || activeTenant?.ownerEmail,
                          logo: tenantDisplayLogo,
                        });
                      }
                    }}
                  >
                    <Printer className="w-3.5 h-3.5 mr-1.5" />
                    Print Quotation
                  </NexaButton>
                  <NexaButton
                    variant="primary"
                    onClick={() => {
                      if (previewQuote) {
                        downloadQuotationPdf(previewQuote, {
                          displayName: tenantDisplayName,
                          domain: previewQuote.senderUrl || previewQuote.columnTitles?.senderUrl || senderUrl || activeTenant?.domain,
                          ownerEmail: previewQuote.senderEmail || previewQuote.columnTitles?.senderEmail || senderEmail || activeTenant?.ownerEmail,
                          logo: tenantDisplayLogo,
                        });
                      }
                    }}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download PDF
                  </NexaButton>
                  <NexaButton variant="secondary" onClick={handleClosePreview}>
                    {isPreviewingDraft ? "Back to Editor" : "Close"}
                  </NexaButton>
                </div>
              </div>
            </div>
          </NexaModal>
        )}

        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #quotation-paper-area,
            #quotation-paper-area * {
              visibility: visible !important;
            }
            #quotation-paper-area {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 12mm 15mm !important;
              border: none !important;
              box-shadow: none !important;
              background: #ffffff !important;
              color: #0f172a !important;
              z-index: 999999 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
          }
        `}</style>
      </div>
    </ErpAdminShell>
  );
}
