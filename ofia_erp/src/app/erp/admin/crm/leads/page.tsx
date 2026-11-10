"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Target,
  Search,
  Plus,
  Sparkles,
  Building2,
  Mail,
  Phone,
  PhoneCall,
  Flame,
  Globe,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Send,
  Trash2,
  Pencil,
  ChevronDown,
  Users,
  UserCheck,
  Eye,
  Calendar,
  Clock,
  Activity,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  MapPin,
  Download,
  Star,
  Award,
  Printer,
  FileText,
  PenTool,
  BookmarkCheck,
  Save,
  User,
} from "lucide-react";
import { IconBrandLinkedin } from "@tabler/icons-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";
import { Pagination } from "@/components/nexa/Pagination";
import { CrmLead, CrmCall, CrmDeal, QuotationCoverLetter } from "@/lib/crm-service";
import { crmFetch } from "@/lib/crm-client";
import { useActiveTenant } from "@/lib/tenant-context";
import { filterSalesClosers } from "@/lib/access-control";
import { PhoneCandidate, isPhoneMissingOrInvalid } from "@/lib/crm-phone-enricher";
import { downloadCoverLetterPdf } from "@/lib/quotation-pdf";

interface LeadCoverLetterTemplate {
  name: string;
  tag: string;
  reference: (lead: Partial<CrmLead>) => string;
  salutation: (lead: Partial<CrmLead>) => string;
  body: (lead: Partial<CrmLead>, tenantName: string) => string;
  signoff: string;
  signatoryTitle: string;
}

const LEAD_COVER_LETTER_TEMPLATES: Record<string, LeadCoverLetterTemplate> = {
  commercial: {
    name: "Corporate Commercial Proposal",
    tag: "Standard B2B",
    reference: (lead) =>
      `COMMERCIAL PROPOSAL & PARTNERSHIP OFFER FOR ${lead.companyName ? lead.companyName.toUpperCase() : "PROSPECTIVE CLIENT"}`,
    salutation: (lead) =>
      lead.contactName ? `Dear ${lead.contactName},` : "Dear Sir/Madam,",
    body: (lead, tenant) =>
      `We have the pleasure of submitting herewith our formal commercial proposal and strategic partnership offer for ${lead.companyName || "your esteemed organization"}.\n\n` +
      `At ${tenant}, we specialize in delivering industry-leading solutions, operational excellence, and measurable value across all engagements. Having reviewed your operational requirements, our team has crafted a tailored commercial structure designed to optimize efficiency while ensuring the highest service quality.\n\n` +
      `Our proposal encompasses dedicated project management, transparent milestone governance, and agile resource deployment to guarantee seamless execution from day one.\n\n` +
      `We remain fully prepared to deploy resources and commence immediate engagement upon your approval. Please do not hesitate to contact our executive desk should you require any clarifications or scope modifications.\n\n` +
      `Thank you for considering ${tenant} as your trusted corporate partner. We look forward to establishing a mutually rewarding commercial relationship.`,
    signoff: "Yours faithfully,",
    signatoryTitle: "Commercial Director / Key Accounts Lead",
  },
  logistics: {
    name: "Logistics, Haulage & Fleet",
    tag: "Freight & Transport",
    reference: (lead) =>
      `FREIGHT HAULAGE & FLEET LOGISTICS PROPOSAL - ${lead.companyName ? lead.companyName.toUpperCase() : "LOGISTICS PARTNER"}`,
    salutation: (lead) =>
      lead.contactName ? `Dear ${lead.contactName},` : "Dear Sir/Madam,",
    body: (lead, tenant) =>
      `We write to officially present our freight haulage, distribution logistics, and fleet operational capabilities for ${lead.companyName || "your organization"}.\n\n` +
      `${tenant} operates a robust, digitally-tracked fleet adhering to rigorous safety standards, comprehensive transit cargo insurance, and on-time dispatch SLAs. Every transit mission is supervised by our 24/7 central control dispatch tower to ensure seamless route transit and cargo integrity.\n\n` +
      `Our operational framework is structured to provide dedicated vehicle allocation, rapid turnaround times, and competitive corporate tariffs tailored to your supply chain volume.\n\n` +
      `We assure ${lead.companyName || "your organization"} of prompt loading, dedicated fleet allocation, and immediate turnaround upon formal agreement.\n\n` +
      `We look forward to an opportunity to partner with your supply chain and distribution division.`,
    signoff: "Yours faithfully,",
    signatoryTitle: "Head of Fleet Operations & Haulage Logistics",
  },
  procurement: {
    name: "Enterprise Supply & Procurement",
    tag: "Material Supply",
    reference: (lead) =>
      `FORMAL PROPOSAL FOR PROCUREMENT AND MATERIAL SUPPLY - ${lead.companyName ? lead.companyName.toUpperCase() : "CLIENT"}`,
    salutation: (lead) =>
      lead.contactName ? `Dear ${lead.contactName},` : "Dear Procurement Committee,",
    body: (lead, tenant) =>
      `We are pleased to submit our formal commercial proposal regarding corporate supply and procurement services for ${lead.companyName || "your organization"}.\n\n` +
      `All items and materials supplied by ${tenant} are sourced directly from certified original equipment manufacturers (OEMs) and adhere strictly to standard regulatory guidelines, statutory quality certifications, and manufacturer warranties. Our established distribution network ensures dependable delivery timelines directly to your designated operational sites.\n\n` +
      `We provide competitive volume pricing schedules, flexible payment settlement terms, and dedicated account management to streamline your procurement cycle and reduce total landed costs.\n\n` +
      `We appreciate your interest and remain at your disposal for technical reviews or commercial discussions.`,
    signoff: "Warm regards,",
    signatoryTitle: "Head of Corporate Procurement & Supplies",
  },
  retainer: {
    name: "Retainer & Service Level Agreement",
    tag: "SLA & Retainer",
    reference: (lead) =>
      `CORPORATE SERVICE RETAINER & SLA PROPOSAL FOR ${lead.companyName ? lead.companyName.toUpperCase() : "ENTERPRISE CLIENT"}`,
    salutation: (lead) =>
      lead.contactName ? `Dear ${lead.contactName},` : "Dear Sir/Madam,",
    body: (lead, tenant) =>
      `We are pleased to present our enterprise service retainer and ongoing support proposal tailored specifically to the operational goals of ${lead.companyName || "your esteemed organization"}.\n\n` +
      `Under this proposed engagement, ${tenant} provides dedicated key account support, priority turnaround times, preventive service routines, and guaranteed service level benchmarks to ensure peak operational reliability and minimize downtime.\n\n` +
      `Our dedicated governance team provides periodic performance dashboards, SLA reviews, and continuous improvement recommendations to ensure your operations achieve sustained competitive advantages.\n\n` +
      `We value the strategic relationship between our organizations and look forward to solidifying our long-term partnership.`,
    signoff: "Respectfully yours,",
    signatoryTitle: "Managing Director / Principal Consultant",
  },
  transmittal: {
    name: "Executive Transmittal Letter",
    tag: "Short Form",
    reference: (lead) =>
      `OFFICIAL PROPOSAL TRANSMITTAL - ${lead.companyName ? lead.companyName.toUpperCase() : "CLIENT"}`,
    salutation: (lead) =>
      lead.contactName ? `Dear ${lead.contactName},` : "Dear Sir/Madam,",
    body: (lead, tenant) =>
      `Please find enclosed our formal business proposal and capability brief for the review of ${lead.companyName || "your organization"}.\n\n` +
      `The enclosed materials outline our corporate overview, technical methodology, delivery commitments, and commercial terms formulated specifically to address your operational priorities.\n\n` +
      `We welcome the opportunity to discuss this proposal in detail with your management team at your earliest convenience.\n\n` +
      `Thank you for considering ${tenant} as your corporate partner. We look forward to hearing from you.`,
    signoff: "Yours sincerely,",
    signatoryTitle: "Commercial Accounts Lead",
  },
};

export default function CrmLeadsPage() {
  const { activeTenant } = useActiveTenant();
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [calls, setCalls] = useState<CrmCall[]>([]);
  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [updatingDealStageId, setUpdatingDealStageId] = useState<string | null>(null);
  const [isPromotingId, setIsPromotingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [callStatusFilter, setCallStatusFilter] = useState("ALL");
  const [repFilter, setRepFilter] = useState("ALL");
  const [phoneFilter, setPhoneFilter] = useState<"ALL" | "MISSING">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // AI Extraction Modal
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false);
  const [extractQuery, setExtractQuery] = useState("Commercial Towers & Facility Operators");
  const [extractLocation, setExtractLocation] = useState("Lagos & Abuja");
  const [isExtracting, setIsExtracting] = useState(false);

  // Manual Add Lead Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newIndustry, setNewIndustry] = useState("Corporate");
  const [newLocation, setNewLocation] = useState("Lagos");
  const [assignedCloser, setAssignedCloser] = useState("Auto-Assign (Least-Loaded)");
  const [availableClosers, setAvailableClosers] = useState<{ id?: string; name: string; email: string }[]>([]);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [isSavingLead, setIsSavingLead] = useState(false);

  // Edit Lead Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<CrmLead | null>(null);
  const [editStatus, setEditStatus] = useState<string>("CURIOUS");
  const [editAssignedCloser, setEditAssignedCloser] = useState<string>("Unassigned");
  const [editCompany, setEditCompany] = useState<string>("");
  const [editContact, setEditContact] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [editPhone, setEditPhone] = useState<string>("");
  const [editLinkedinUrl, setEditLinkedinUrl] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Buying Signals Modal
  const [isSignalsModalOpen, setIsSignalsModalOpen] = useState(false);
  const [selectedSignalsLead, setSelectedSignalsLead] = useState<CrmLead | null>(null);

  // AI Phone Enrichment Modal State
  const [isEnrichModalOpen, setIsEnrichModalOpen] = useState(false);
  const [enrichingLead, setEnrichingLead] = useState<CrmLead | null>(null);
  const [enrichStatus, setEnrichStatus] = useState<"idle" | "searching" | "success" | "empty" | "error">("idle");
  const [enrichCandidates, setEnrichCandidates] = useState<PhoneCandidate[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string>("");
  const [customPhoneInput, setCustomPhoneInput] = useState<string>("");
  const [enrichSearchQuery, setEnrichSearchQuery] = useState<string>("");
  const [enrichErrorMessage, setEnrichErrorMessage] = useState<string>("");
  const [isApplyingPhone, setIsApplyingPhone] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const tenantDisplayName =
    activeTenant?.name ||
    (typeof window !== "undefined"
      ? localStorage.getItem("nexa_tenant_name") || localStorage.getItem("tenant_name")
      : null) ||
    "ReedBreed Logistics Hub";

  const tenantDisplayLogo =
    activeTenant?.logo ||
    (typeof window !== "undefined"
      ? localStorage.getItem("nexa_tenant_logo") || localStorage.getItem("tenant_logo")
      : null) ||
    "";

  // Cover Letter Generator States (Tied to Lead)
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [coverLetterLead, setCoverLetterLead] = useState<CrmLead | null>(null);
  const [coverLetterDate, setCoverLetterDate] = useState("");
  const [coverRecipientName, setCoverRecipientName] = useState("");
  const [coverRecipientTitle, setCoverRecipientTitle] = useState("");
  const [coverRecipientCompany, setCoverRecipientCompany] = useState("");
  const [coverRecipientAddress, setCoverRecipientAddress] = useState("");
  const [coverLetterReference, setCoverLetterReference] = useState("");
  const [coverLetterSalutation, setCoverLetterSalutation] = useState("");
  const [coverLetterBody, setCoverLetterBody] = useState("");
  const [coverLetterSignoff, setCoverLetterSignoff] = useState("Yours faithfully,");
  const [coverSignatoryName, setCoverSignatoryName] = useState("");
  const [coverSignatoryTitle, setCoverSignatoryTitle] = useState("");
  const [coverSignatoryDepartment, setCoverSignatoryDepartment] = useState("");
  const [coverSignatoryContact, setCoverSignatoryContact] = useState("");
  const [coverTenantFooter, setCoverTenantFooter] = useState(
    "RC 1892019 • Tax ID: 22001923-0001 • Corporate HQ: Victoria Island, Lagos, Nigeria • Confidential & Proprietary Document"
  );
  const [coverDocumentBadge, setCoverDocumentBadge] = useState("OFFICIAL TRANSMITTAL");
  const [activeTemplateKey, setActiveTemplateKey] = useState("commercial");
  const [isSavingCoverLetter, setIsSavingCoverLetter] = useState(false);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);

  const handleOpenCoverLetter = (targetLead?: CrmLead | null) => {
    const lead = targetLead || (leads.length > 0 ? leads[0] : null);
    setCoverLetterLead(lead);

    const today = new Date();
    const day = today.getDate();
    const suffix = ["th", "st", "nd", "rd"][(day % 10 > 3 || Math.floor((day % 100) / 10) === 1) ? 0 : day % 10];
    const monthName = today.toLocaleDateString("en-US", { month: "long" });
    const year = today.getFullYear();
    const formattedDate = `${day}${suffix} ${monthName}, ${year}`;

    setCoverLetterDate(formattedDate);

    if (lead?.coverLetter) {
      const cl = lead.coverLetter;
      setCoverLetterDate(cl.date || formattedDate);
      setCoverRecipientName(cl.recipientName || lead.contactName || (lead as any).name || "The Managing Director");
      setCoverRecipientTitle(cl.recipientTitle || lead.contactTitle || "");
      setCoverRecipientCompany(cl.companyName || lead.companyName || (lead as any).company || "");
      setCoverRecipientAddress(cl.recipientAddress || lead.location || "Victoria Island / Commercial District, Lagos, Nigeria");
      setCoverLetterReference(cl.reference || `COMMERCIAL PROPOSAL FOR ${(lead.companyName || (lead as any).company || "").toUpperCase()}`);
      setCoverLetterSalutation(cl.salutation || (lead.contactName ? `Dear ${lead.contactName},` : "Dear Sir/Madam,"));
      setCoverLetterBody(cl.body || "");
      setCoverLetterSignoff(cl.signoff || "Yours faithfully,");
      setCoverSignatoryName(cl.signatoryName || lead.assignedRep || activeTenant?.ownerName || tenantDisplayName);
      setCoverSignatoryTitle(cl.signatoryTitle || "Commercial Director / Key Accounts Lead");
      setCoverSignatoryDepartment(cl.signatoryDepartment || "Commercial & Strategic Key Accounts Directorate");
      setCoverSignatoryContact(cl.signatoryContact || (activeTenant?.ownerEmail ? `${activeTenant.ownerEmail} | ${activeTenant?.domain || "www.ofia.ng"}` : "+234 800 000 0000 | ops@ofia.ng"));
      setCoverTenantFooter(cl.tenantFooterNote || "RC 1892019 • Tax ID: 22001923-0001 • Corporate HQ: Victoria Island, Lagos, Nigeria • Confidential & Proprietary Document");
      setCoverDocumentBadge(cl.documentBadge || "OFFICIAL TRANSMITTAL");
      setActiveTemplateKey(cl.templateKey || "commercial");
    } else if (lead) {
      const tpl = LEAD_COVER_LETTER_TEMPLATES.commercial;
      setCoverRecipientName(lead.contactName || (lead as any).name || "The Managing Director");
      setCoverRecipientTitle(lead.contactTitle || "");
      setCoverRecipientCompany(lead.companyName || (lead as any).company || "Client Organization");
      setCoverRecipientAddress(lead.location || "Victoria Island / Commercial District, Lagos, Nigeria");
      setCoverLetterReference(tpl.reference(lead));
      setCoverLetterSalutation(tpl.salutation(lead));
      setCoverLetterBody(tpl.body(lead, tenantDisplayName));
      setCoverLetterSignoff(tpl.signoff);
      setCoverSignatoryName(lead.assignedRep || activeTenant?.ownerName || tenantDisplayName);
      setCoverSignatoryTitle(tpl.signatoryTitle);
      setCoverSignatoryDepartment("Commercial & Strategic Key Accounts Directorate");
      setCoverSignatoryContact(activeTenant?.ownerEmail ? `${activeTenant.ownerEmail} | ${activeTenant?.domain || "www.ofia.ng"}` : "+234 800 000 0000 | ops@ofia.ng");
      setCoverTenantFooter("RC 1892019 • Tax ID: 22001923-0001 • Corporate HQ: Victoria Island, Lagos, Nigeria • Confidential & Proprietary Document");
      setCoverDocumentBadge("OFFICIAL TRANSMITTAL");
      setActiveTemplateKey("commercial");
    } else {
      setCoverRecipientName("The Managing Director / Procurement Committee");
      setCoverRecipientTitle("");
      setCoverRecipientCompany("Client Organization");
      setCoverRecipientAddress("Victoria Island, Lagos, Nigeria");
      setCoverLetterReference("COMMERCIAL PROPOSAL & STRATEGIC PARTNERSHIP BRIEF");
      setCoverLetterSalutation("Dear Sir/Madam,");
      setCoverLetterBody(
        `We have the pleasure of submitting herewith our formal commercial proposal and strategic partnership offer.\n\n` +
        `At ${tenantDisplayName}, we specialize in delivering industry-leading solutions, operational excellence, and measurable value across all engagements. Having reviewed your operational requirements, our team has crafted a tailored commercial structure designed to optimize efficiency while ensuring the highest service quality.\n\n` +
        `Our proposal encompasses dedicated project management, transparent milestone governance, and agile resource deployment to guarantee seamless execution from day one.\n\n` +
        `We remain fully prepared to deploy resources and commence immediate engagement upon your approval. Please do not hesitate to contact our executive desk should you require any clarifications or scope modifications.\n\n` +
        `Thank you for considering ${tenantDisplayName} as your trusted corporate partner. We look forward to establishing a mutually rewarding commercial relationship.`
      );
      setCoverLetterSignoff("Yours faithfully,");
      setCoverSignatoryName(tenantDisplayName);
      setCoverSignatoryTitle("Commercial Director");
      setCoverSignatoryDepartment("Commercial & Operations Directorate");
      setCoverSignatoryContact(activeTenant?.ownerEmail ? `${activeTenant.ownerEmail} | ${activeTenant?.domain || "www.ofia.ng"}` : "+234 800 000 0000 | ops@ofia.ng");
      setCoverTenantFooter("RC 1892019 • Tax ID: 22001923-0001 • Corporate HQ: Victoria Island, Lagos, Nigeria • Confidential & Proprietary Document");
      setCoverDocumentBadge("OFFICIAL TRANSMITTAL");
      setActiveTemplateKey("commercial");
    }

    setIsCoverLetterModalOpen(true);
  };

  const handleApplyCoverLetterTemplate = (tplKey: string) => {
    setActiveTemplateKey(tplKey);
    const tpl = LEAD_COVER_LETTER_TEMPLATES[tplKey];
    if (!tpl) return;
    const l = coverLetterLead || {};
    setCoverLetterReference(tpl.reference(l));
    setCoverLetterSalutation(tpl.salutation(l));
    setCoverLetterBody(tpl.body(l, tenantDisplayName));
    setCoverLetterSignoff(tpl.signoff);
    setCoverSignatoryTitle(tpl.signatoryTitle);
  };

  const handleSwitchCoverLetterLead = (leadId: string) => {
    const l = leads.find((item) => item.id === leadId) || null;
    if (l) {
      handleOpenCoverLetter(l);
    }
  };

  const handleSaveCoverLetter = async () => {
    if (!coverLetterLead) {
      alert("Please select a lead to save this cover letter.");
      return;
    }

    setIsSavingCoverLetter(true);
    const coverLetterPayload: QuotationCoverLetter = {
      date: coverLetterDate,
      recipientName: coverRecipientName,
      recipientTitle: coverRecipientTitle,
      companyName: coverRecipientCompany,
      recipientAddress: coverRecipientAddress,
      reference: coverLetterReference,
      salutation: coverLetterSalutation,
      body: coverLetterBody,
      signoff: coverLetterSignoff,
      signatoryName: coverSignatoryName,
      signatoryTitle: coverSignatoryTitle,
      signatoryDepartment: coverSignatoryDepartment,
      signatoryContact: coverSignatoryContact,
      tenantFooterNote: coverTenantFooter,
      documentBadge: coverDocumentBadge,
      templateKey: activeTemplateKey,
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await crmFetch("/api/erp/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_COVER_LETTER",
          id: coverLetterLead.id,
          coverLetter: coverLetterPayload,
          contactTitle: coverRecipientTitle || undefined,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === coverLetterLead.id
              ? {
                  ...l,
                  contactName: coverRecipientName || l.contactName,
                  contactTitle: coverRecipientTitle || l.contactTitle,
                  companyName: coverRecipientCompany || l.companyName,
                  location: coverRecipientAddress || l.location,
                  coverLetter: coverLetterPayload,
                }
              : l
          )
        );
        setCoverLetterLead((prev) =>
          prev
            ? {
                ...prev,
                contactName: coverRecipientName || prev.contactName,
                contactTitle: coverRecipientTitle || prev.contactTitle,
                companyName: coverRecipientCompany || prev.companyName,
                location: coverRecipientAddress || prev.location,
                coverLetter: coverLetterPayload,
              }
            : null
        );
        alert("Cover letter saved successfully to this lead!");
      } else {
        throw new Error(data?.error || "Failed to save cover letter");
      }
    } catch (err: any) {
      alert(err.message || "Failed to save cover letter");
    } finally {
      setIsSavingCoverLetter(false);
    }
  };

  const handlePrintCoverLetter = () => {
    downloadCoverLetterPdf({
      tenantName: tenantDisplayName,
      tenantDomain: (activeTenant?.domain || "Official Commercial & Operations Suite").trim(),
      tenantContact: (activeTenant?.ownerEmail ? `Contact: ${activeTenant.ownerEmail}` : "Victoria Island / Ikeja Central Depot, Lagos, Nigeria").trim(),
      tenantLogo: tenantDisplayLogo,
      tenantFooter: coverTenantFooter,
      date: coverLetterDate,
      recipientName: coverRecipientName,
      recipientTitle: coverRecipientTitle,
      companyName: coverRecipientCompany,
      recipientAddress: coverRecipientAddress,
      reference: coverLetterReference,
      salutation: coverLetterSalutation,
      body: coverLetterBody,
      signoff: coverLetterSignoff,
      signatoryName: coverSignatoryName,
      signatoryTitle: coverSignatoryTitle,
      signatoryDepartment: coverSignatoryDepartment,
      signatoryContact: coverSignatoryContact,
      quotationNumber: coverLetterLead ? (coverLetterLead.id.startsWith("LED-") ? coverLetterLead.id : "LD-" + coverLetterLead.id.slice(-6).toUpperCase()) : "PROP-REF",
      documentBadge: coverDocumentBadge || "OFFICIAL TRANSMITTAL",
    });
  };

  const handleCopyCoverLetterText = () => {
    const fullText = [
      tenantDisplayName.toUpperCase(),
      activeTenant?.domain || "Official Commercial & Operations Suite",
      activeTenant?.ownerEmail ? `Contact: ${activeTenant.ownerEmail}` : "",
      "----------------------------------------",
      `Date: ${coverLetterDate}`,
      "",
      "Delivered / Addressed To:",
      coverRecipientName,
      coverRecipientTitle ? `${coverRecipientTitle}` : "",
      coverRecipientCompany,
      coverRecipientAddress ? `${coverRecipientAddress}` : "",
      "",
      `RE: ${coverLetterReference}`,
      "",
      coverLetterSalutation,
      "",
      coverLetterBody,
      "",
      coverLetterSignoff,
      "",
      coverSignatoryName,
      coverSignatoryTitle ? `${coverSignatoryTitle}` : "",
      coverSignatoryDepartment ? `${coverSignatoryDepartment}` : "",
      coverSignatoryContact ? `${coverSignatoryContact}` : "",
      "----------------------------------------",
      coverTenantFooter,
    ]
      .filter((line) => line !== undefined && line !== null)
      .join("\n");

    navigator.clipboard.writeText(fullText);
    setCopiedCoverLetter(true);
    setTimeout(() => setCopiedCoverLetter(false), 2500);
  };

  const getLeadCalls = (lead: CrmLead | null): CrmCall[] => {
    if (!lead || !Array.isArray(calls) || calls.length === 0) return [];
    const leadId = lead.id;
    const leadPhone = (lead.contactPhone || (lead as any).phone || "").replace(/[^0-9]/g, "");
    const leadLast10 = leadPhone.length >= 10 ? leadPhone.slice(-10) : "";
    const leadLast7 = leadPhone.length >= 7 ? leadPhone.slice(-7) : "";
    const leadName = (lead.contactName || (lead as any).name || "").trim().toLowerCase();
    const leadComp = (lead.companyName || (lead as any).company || "").trim().toLowerCase();

    const matched: CrmCall[] = [];
    const seenCallIds = new Set<string>();

    for (const c of calls) {
      if (!c) continue;
      const callId = c.id || `${c.callDate}-${c.phoneNumber}-${c.outcome}`;
      if (seenCallIds.has(callId)) continue;

      let isMatch = false;
      const cLeadId = c.leadId || (c as any).lead_id;
      if (leadId && cLeadId && cLeadId === leadId) {
        isMatch = true;
      }

      if (!isMatch && leadPhone && c.phoneNumber) {
        const cPhone = c.phoneNumber.replace(/[^0-9]/g, "");
        if (cPhone.length >= 7) {
          if (leadLast10 && cPhone.includes(leadLast10)) isMatch = true;
          else if (leadLast7 && cPhone.endsWith(leadLast7)) isMatch = true;
          else if (cPhone.length >= 7 && leadPhone.endsWith(cPhone.slice(-7))) isMatch = true;
        }
      }

      if (!isMatch && leadName && leadComp && c.contactName && c.company) {
        if (
          c.contactName.trim().toLowerCase() === leadName &&
          c.company.trim().toLowerCase() === leadComp
        ) {
          isMatch = true;
        }
      }

      if (!isMatch && leadName && leadName.length > 3 && c.contactName) {
        if (c.contactName.trim().toLowerCase() === leadName) {
          isMatch = true;
        }
      }

      if (!isMatch && leadComp && leadComp.length > 3 && c.company) {
        if (c.company.trim().toLowerCase() === leadComp) {
          isMatch = true;
        }
      }

      if (isMatch) {
        seenCallIds.add(callId);
        matched.push(c);
      }
    }

    matched.sort((a, b) => {
      const tA = new Date(a.callDate || a.createdAt || 0).getTime();
      const tB = new Date(b.callDate || b.createdAt || 0).getTime();
      return tB - tA;
    });

    return matched;
  };

  const getSignalItems = (lead: CrmLead | null) => {
    if (!lead) return [];

    const baseCreatedAt = lead.createdAt ? new Date(lead.createdAt) : new Date();
    const validBaseTime = isNaN(baseCreatedAt.getTime()) ? new Date() : baseCreatedAt;
    const updatedAt = lead.updatedAt ? new Date(lead.updatedAt) : null;
    const validUpdateTime = updatedAt && !isNaN(updatedAt.getTime()) ? updatedAt : null;

    const matchedCalls = getLeadCalls(lead);
    const items: {
      id: string | number;
      text: string;
      eventDate: string;
      eventTime: string;
      eventType: "CALL" | "CAMPAIGN" | "ASSIGNMENT" | "INBOUND" | "SIGNAL";
      timestamp: number;
      callDetails?: {
        repName?: string;
        outcome?: string;
        direction?: string;
        durationSeconds?: number;
        callScore?: number;
        recordingUrl?: string;
        followupDate?: string;
      };
    }[] = [];

    // 1. Process actual logged calls from CRM
    for (const c of matchedCalls) {
      const callDateObj = new Date(
        c.callDate || (c as any).call_date || c.createdAt || (c as any).created_at || validBaseTime
      );
      const validCallDate = !isNaN(callDateObj.getTime()) ? callDateObj : validBaseTime;

      const eventDate = validCallDate.toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const eventTime = validCallDate.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const durSec = Number(c.durationSeconds ?? (c as any).duration_seconds ?? 0);
      const durStr = durSec > 0 ? ` [${Math.floor(durSec / 60)}m ${durSec % 60}s]` : "";
      const rep = c.repName || (c as any).rep_name || (c.isAi ? "Ofia Voice Agent" : "Sales Closer");
      const outcome = c.outcome || "COMPLETED";
      const callScoreNum = Math.min(12, Math.max(0, Number(c.callScore ?? (c as any).call_score) || 0));
      const scoreStr = callScoreNum > 0 ? ` [Score: ${callScoreNum}/12]` : "";
      const notesText =
        c.notes?.trim() ||
        c.aiSummary?.trim() ||
        (c as any).ai_summary?.trim() ||
        "Logged phone conversation disposition.";
      const follow = c.followupDate || (c as any).followup_date || "";
      const followStr = follow.trim() ? ` • Followup: ${follow.trim()}` : "";

      const text = `Call Log (${outcome})${scoreStr} by ${rep}${durStr}: ${notesText}${followStr}`;

      items.push({
        id: `call-${c.id || Math.random()}`,
        text,
        eventDate,
        eventTime,
        eventType: "CALL",
        timestamp: validCallDate.getTime(),
        callDetails: {
          repName: rep,
          outcome,
          direction: c.direction || "OUTBOUND",
          durationSeconds: durSec,
          callScore: callScoreNum,
          recordingUrl: c.recordingUrl || (c as any).recording_url || "",
          followupDate: follow,
        },
      });
    }

    // 2. Process buyingSignals and lead notes
    const rawSignals: string[] = [];
    if (Array.isArray(lead.buyingSignals)) {
      for (const s of lead.buyingSignals) {
        if (typeof s === "string" && s.trim()) rawSignals.push(s.trim());
      }
    }
    if (lead.notes && typeof lead.notes === "string" && lead.notes.trim()) {
      if (!rawSignals.includes(lead.notes.trim())) {
        rawSignals.push(lead.notes.trim());
      }
    }

    const splitSignals: string[] = [];
    for (const s of rawSignals) {
      if (typeof s !== "string") continue;
      const parts = s
        .split(
          /\r?\n|(?<=[.!?])\s+(?=(?:Call Log\s*\(|Lead auto-assigned|Email [bB]last|Inbound|Outbound|Direct Outreach|Converted to Deal|Promoted to Deal|Deal Won|Meeting Scheduled))/g
        )
        .map((p) => p.trim())
        .filter(Boolean);
      splitSignals.push(...parts);
    }

    // De-duplicate signals that describe calls already captured in matchedCalls
    for (let idx = 0; idx < splitSignals.length; idx++) {
      let text = splitSignals[idx].trim();
      if (!text) continue;

      let eventType: "CALL" | "CAMPAIGN" | "ASSIGNMENT" | "INBOUND" | "SIGNAL" = "SIGNAL";
      if (text.toLowerCase().startsWith("call log") || text.includes("(CONNECTED_") || text.includes("Call Log")) {
        eventType = "CALL";
      } else if (text.toLowerCase().includes("email blast") || text.toLowerCase().includes("opened the email")) {
        eventType = "CAMPAIGN";
      } else if (text.toLowerCase().includes("auto-assigned")) {
        eventType = "ASSIGNMENT";
      } else if (text.toLowerCase().includes("inbound")) {
        eventType = "INBOUND";
      }

      // If this is a call signal, check if it's already represented in items
      if (eventType === "CALL" && matchedCalls.length > 0) {
        const isAlreadyAdded = items.some((it) => {
          if (it.eventType !== "CALL") return false;
          const outcomeMatch = text.match(/Call Log\s*\(([^)]+)\)/i);
          if (
            outcomeMatch &&
            it.callDetails?.outcome &&
            outcomeMatch[1].toUpperCase() === it.callDetails.outcome.toUpperCase()
          ) {
            return true;
          }
          return false;
        });
        if (isAlreadyAdded) continue;
      }

      let eventDate = "";
      let eventTime = "";
      let timestamp = validBaseTime.getTime() - (idx + 1) * 1000 * 60 * 15;

      // Check if text has timestamp prefix like [YYYY-MM-DD HH:MM:SS]
      const match = text.match(
        /^\[?(20\d{2}[-/.]\d{1,2}[-/.]\d{1,2}(?:[ T]\d{1,2}:\d{2}(?::\d{2})?)?)\]?\s*[:-]?\s*(.*)$/
      );
      if (match) {
        const parsed = new Date(match[1]);
        if (!isNaN(parsed.getTime())) {
          eventDate = parsed.toLocaleDateString(undefined, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          eventTime = parsed.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          text = match[2].trim() || text;
          timestamp = parsed.getTime();
        }
      }

      if (!eventDate && eventType === "CALL" && validUpdateTime) {
        eventDate = validUpdateTime.toLocaleDateString(undefined, {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        eventTime = validUpdateTime.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        timestamp = validUpdateTime.getTime();
      }

      if (!eventDate) {
        const itemDate = new Date(timestamp);
        eventDate = itemDate.toLocaleDateString(undefined, {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        eventTime = itemDate.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      }

      items.push({
        id: `sig-${idx}`,
        text,
        eventDate,
        eventTime,
        eventType,
        timestamp,
      });
    }

    // Fallback if completely empty
    if (items.length === 0) {
      items.push({
        id: "default-inbound",
        text: "Direct Commercial Lead Inbound",
        eventDate: validBaseTime.toLocaleDateString(undefined, {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        eventTime: validBaseTime.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        eventType: "INBOUND",
        timestamp: validBaseTime.getTime(),
      });
    }

    // Sort items chronologically descending (newest event first)
    items.sort((a, b) => b.timestamp - a.timestamp);

    return items;
  };

  useEffect(() => {
    async function loadClosers() {
      try {
        const res = await crmFetch("/api/erp/users").then((r) => (r.ok ? r.json() : [])).catch(() => []);
        const rawUsers = Array.isArray(res) ? res : Array.isArray(res?.users) ? res.users : [];
        const validClosers = filterSalesClosers(rawUsers);
        setAvailableClosers(validClosers);
      } catch (err) {
        console.warn("Could not load sales closers:", err);
      }
    }
    loadClosers();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qRep = params.get("rep") || params.get("assignedRep");
      if (qRep) {
        setRepFilter(qRep);
      }
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [leadsRes, callsRes, dealsRes] = await Promise.all([
          crmFetch("/api/erp/crm/leads").then((r) => r.json()).catch(() => null),
          crmFetch("/api/erp/crm/calls").then((r) => r.json()).catch(() => null),
          crmFetch("/api/erp/crm/deals").then((r) => r.json()).catch(() => null),
        ]);
        const rawLeads = Array.isArray(leadsRes) ? leadsRes : Array.isArray(leadsRes?.leads) ? leadsRes.leads : [];
        const seenIds = new Set<string>();
        const seenEmails = new Set<string>();
        const seenPhones = new Set<string>();
        const seenNameComp = new Set<string>();
        const uniqueRawLeads: any[] = [];

        for (const l of rawLeads) {
          if (!l || !l.id) continue;
          if (seenIds.has(l.id)) continue;

          const emailKey = (l.email || l.contactEmail || "").toLowerCase().trim();
          const isDummyEmail = !emailKey || emailKey.includes("@example.");
          const cleanPhone = (l.phone || l.contactPhone || "").replace(/[^0-9]/g, "");
          const phoneKey = cleanPhone.length >= 8 ? cleanPhone.slice(-8) : "";
          const nameStr = (l.name || l.contactName || "").toLowerCase().trim();
          const compStr = (l.company || l.companyName || "").toLowerCase().trim();
          const nameCompKey = nameStr && compStr ? `${nameStr}|${compStr}` : "";

          let isDup = false;
          if (!isDummyEmail && seenEmails.has(emailKey)) isDup = true;
          else if (phoneKey && seenPhones.has(phoneKey)) isDup = true;
          else if (nameCompKey && seenNameComp.has(nameCompKey)) isDup = true;

          if (!isDup) {
            seenIds.add(l.id);
            if (!isDummyEmail) seenEmails.add(emailKey);
            if (phoneKey) seenPhones.add(phoneKey);
            if (nameCompKey) seenNameComp.add(nameCompKey);
            uniqueRawLeads.push(l);
          }
        }

        const normalizedLeads = uniqueRawLeads.map((l: any) => {
          const rawSignals: string[] = [];
          if (Array.isArray(l.buyingSignals)) {
            for (const s of l.buyingSignals) {
              if (typeof s === "string" && s.trim()) rawSignals.push(s.trim());
            }
          }
          if (l.notes && typeof l.notes === "string" && l.notes.trim()) {
            if (!rawSignals.includes(l.notes.trim())) {
              rawSignals.push(l.notes.trim());
            }
          }
          if (rawSignals.length === 0) {
            rawSignals.push("Direct Outreach");
          }

          const splitSignals: string[] = [];
          for (const s of rawSignals) {
            if (typeof s !== "string") continue;
            const parts = s
              .split(
                /\r?\n|(?<=[.!?])\s+(?=(?:Call Log\s*\(|Lead auto-assigned|Email [bB]last|Inbound|Outbound|Direct Outreach|Converted to Deal|Promoted to Deal|Deal Won|Meeting Scheduled))/g
              )
              .map((p) => p.trim())
              .filter(Boolean);
            splitSignals.push(...parts);
          }

          return {
            ...l,
            icpFitScore: l.icpFitScore ?? l.score ?? 75,
            buyingSignals: splitSignals.length > 0 ? splitSignals : ["Direct Outreach"],
          };
        });
        setLeads(normalizedLeads);
        const rawCalls = Array.isArray(callsRes?.calls)
          ? callsRes.calls
          : Array.isArray(callsRes)
          ? callsRes
          : [];
        setCalls(rawCalls);
        const rawDeals = Array.isArray(dealsRes?.deals)
          ? dealsRes.deals
          : Array.isArray(dealsRes)
          ? dealsRes
          : [];
        setDeals(rawDeals);
      } catch {
        setLeads([]);
        setCalls([]);
        setDeals([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Memoize latest call by leadId, phone number, and contact info
  const latestCallByLead = useMemo(() => {
    const map = new Map<string, CrmCall>();
    // calls is ordered by callDate DESC (most recent first)
    for (const c of calls) {
      if (c.leadId && !map.has(`id:${c.leadId}`)) {
        map.set(`id:${c.leadId}`, c);
      }
      if (c.phoneNumber) {
        const clean = c.phoneNumber.replace(/[^0-9]/g, "");
        if (clean.length >= 7) {
          if (!map.has(`phone:${clean.slice(-10)}`)) map.set(`phone:${clean.slice(-10)}`, c);
          if (!map.has(`phone:${clean.slice(-7)}`)) map.set(`phone:${clean.slice(-7)}`, c);
        }
      }
      if (c.contactName && c.company) {
        const key = `name_comp:${c.contactName.trim().toLowerCase()}_${c.company.trim().toLowerCase()}`;
        if (!map.has(key)) {
          map.set(key, c);
        }
      }
      if (c.contactName) {
        const key = `name:${c.contactName.trim().toLowerCase()}`;
        if (!map.has(key)) map.set(key, c);
      }
      if (c.company) {
        const key = `comp:${c.company.trim().toLowerCase()}`;
        if (!map.has(key)) map.set(key, c);
      }
    }
    return map;
  }, [calls]);

  const getLeadCallInfo = (lead: CrmLead) => {
    let call: CrmCall | undefined;
    if (lead.id) {
      call = latestCallByLead.get(`id:${lead.id}`);
    }
    const leadPhone = lead.contactPhone || (lead as any).phone;
    if (!call && leadPhone) {
      const clean = leadPhone.replace(/[^0-9]/g, "");
      if (clean.length >= 7) {
        call =
          latestCallByLead.get(`phone:${clean.slice(-10)}`) ||
          latestCallByLead.get(`phone:${clean.slice(-7)}`);
      }
    }
    if (!call && lead.contactName && lead.companyName) {
      const key = `name_comp:${lead.contactName.trim().toLowerCase()}_${lead.companyName.trim().toLowerCase()}`;
      call = latestCallByLead.get(key);
    }
    if (!call && lead.contactName) {
      call = latestCallByLead.get(`name:${lead.contactName.trim().toLowerCase()}`);
    }
    if (!call && lead.companyName) {
      call = latestCallByLead.get(`comp:${lead.companyName.trim().toLowerCase()}`);
    }
    if (!call) {
      const callsForLead = getLeadCalls(lead);
      if (callsForLead.length > 0) call = callsForLead[0];
    }
    return call;
  };

  const hasCallLogForLead = (lead: CrmLead) => {
    const call = getLeadCallInfo(lead);
    if (call) return true;
    const notesText = [
      lead.notes || "",
      ...(Array.isArray(lead.buyingSignals) ? lead.buyingSignals : []),
    ].join(" ");
    return (
      /Call Log\s*\(/i.test(notesText) ||
      /\b(CONNECTED_[A-Z_]+|NOT_INTERESTED|NO_ANSWER|WRONG_NUMBER|BUSY|VOICEMAIL)\b/i.test(notesText)
    );
  };

  const getDealForLead = (lead: CrmLead) => {
    return deals.find(
      (d) =>
        (d.leadId && d.leadId === lead.id) ||
        (lead.convertedDealId && d.id === lead.convertedDealId)
    );
  };

  const getCallIndicator = (call?: CrmCall, lead?: CrmLead) => {
    let outcome = call?.outcome ? String(call.outcome).toUpperCase().trim() : "";

    // If no outcome from call object, inspect lead notes / buying signals for embedded call logs
    if (!outcome && lead) {
      const notesText = [
        lead.notes || "",
        ...(Array.isArray(lead.buyingSignals) ? lead.buyingSignals : []),
      ].join(" ");

      const match =
        notesText.match(/Call Log\s*\(([^)]+)\)/i) ||
        notesText.match(/\b(CONNECTED_[A-Z_]+|NOT_INTERESTED|NO_ANSWER|WRONG_NUMBER|BUSY|VOICEMAIL)\b/i);

      if (match) {
        outcome = match[1].toUpperCase().trim();
      }
    }

    // ORANGE: wrong number
    if (
      outcome === "WRONG_NUMBER" ||
      outcome.includes("WRONG")
    ) {
      return {
        color: "orange" as const,
        label: "Wrong Number",
        tooltip: "Call Logger: Wrong Number (Click to log new call)",
        dotClass: "bg-orange-500",
      };
    }

    // RED: not interested
    if (
      outcome === "NOT_INTERESTED" ||
      outcome.includes("NOT_INTERESTED")
    ) {
      return {
        color: "red" as const,
        label: "Not Interested",
        tooltip: "Call Logger: Not Interested (Click to log new call)",
        dotClass: "bg-rose-500",
      };
    }

    // GREEN: interested, proposal, deal won
    if (
      outcome === "CONNECTED_INTERESTED" ||
      outcome === "CONNECTED_NEGOTIATING" ||
      outcome === "CONNECTED_WON" ||
      (outcome.includes("INTERESTED") && !outcome.includes("NOT_INTERESTED")) ||
      outcome.includes("NEGOTIATING") ||
      outcome.includes("WON")
    ) {
      const outcomeLabel =
        outcome === "CONNECTED_WON" || outcome.includes("WON")
          ? "Deal Closed / Won"
          : outcome === "CONNECTED_NEGOTIATING" || outcome.includes("NEGOTIATING")
          ? "Proposal / Negotiating"
          : "Interested & Qualified";
      return {
        color: "green" as const,
        label: outcomeLabel,
        tooltip: `Call Logger: ${outcomeLabel} (Click to log new call)`,
        dotClass: "bg-emerald-500",
      };
    }

    // YELLOW: call back, no answer, busy, voicemail
    if (
      outcome === "CONNECTED_FOLLOWUP" ||
      outcome === "NO_ANSWER" ||
      outcome === "BUSY" ||
      outcome === "VOICEMAIL" ||
      outcome.includes("FOLLOWUP") ||
      outcome.includes("CALLBACK") ||
      outcome.includes("ANSWER") ||
      outcome.includes("BUSY") ||
      outcome.includes("VOICEMAIL")
    ) {
      const outcomeLabel =
        outcome === "CONNECTED_FOLLOWUP" || outcome.includes("FOLLOWUP")
          ? "Callback Scheduled"
          : outcome === "VOICEMAIL" || outcome.includes("VOICEMAIL")
          ? "Left Voicemail"
          : outcome === "BUSY" || outcome.includes("BUSY")
          ? "Busy / Line Busy"
          : "No Answer / Ringing";
      return {
        color: "yellow" as const,
        label: outcomeLabel,
        tooltip: `Call Logger: ${outcomeLabel} (Click to log new call)`,
        dotClass: "bg-amber-500",
      };
    }

    // If still no specific call outcome, check if lead status confirms they have been contacted!
    if (lead) {
      if (
        lead.status === "CONVERTED" ||
        lead.status === "MEETING_BOOKED" ||
        lead.status === "QUALIFIED" ||
        lead.status === "PROPOSAL"
      ) {
        return {
          color: "green" as const,
          label: `Contacted & ${lead.status}`,
          tooltip: `Contacted & Advanced (${lead.status}) - Click to log new call`,
          dotClass: "bg-emerald-500",
        };
      }
      if (lead.status === "CONTACTED") {
        return {
          color: "yellow" as const,
          label: "Contacted",
          tooltip: "Contacted - Click to record call details",
          dotClass: "bg-amber-500",
        };
      }
    }

    // Fallback: Blue (not on call logger or unclassified)
    return {
      color: "blue" as const,
      label: "Not on call logger",
      tooltip: "Not on call logger - click to log call",
      dotClass: "bg-blue-500",
    };
  };

  const handleExtractLeads = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExtracting(true);

    try {
      const res = await crmFetch("/api/erp/crm/leads/extract", {
        method: "POST",
        body: JSON.stringify({
          query: extractQuery,
          location: extractLocation,
        }),
      });
      const data = await res.json();
      if (data.lead) {
        setLeads((prev) => {
          const leadEmail = (data.lead.contactEmail || data.lead.email || "").toLowerCase().trim();
          const filtered = prev.filter(
            (l) =>
              l.id !== data.lead.id &&
              !(leadEmail && l.contactEmail && l.contactEmail.toLowerCase().trim() === leadEmail)
          );
          return [data.lead, ...filtered];
        });
      }
    } catch {
      // Local fallback
      const fallbackExtracted: CrmLead = {
        id: `LEAD-${Date.now().toString().slice(-4)}`,
        tenantSlug: "default",
        companyName: `${extractQuery} Prospect Ltd`,
        website: "https://example.com.ng",
        industry: "Commercial",
        location: extractLocation,
        contactName: "Engr. Folake Adeleke",
        contactTitle: "Managing Director",
        contactEmail: "folake@example.com.ng",
        contactPhone: "+2348021122334",
        icpFitScore: 95,
        buyingSignals: ["Verified executive contact", "Corporate entity matched"],
        status: "CURIOUS",
        source: "AI Prospector Engine",
        assignedRep: "Senior Sales Specialist",
        notes: "Enriched via automated AI crawler.",
        createdAt: new Date().toISOString(),
      };
      setLeads((prev) => {
        const fallbackEmail = fallbackExtracted.contactEmail.toLowerCase().trim();
        const filtered = prev.filter(
          (l) => l.contactEmail?.toLowerCase().trim() !== fallbackEmail
        );
        return [fallbackExtracted, ...filtered];
      });
    } finally {
      setIsExtracting(false);
      setIsExtractModalOpen(false);
    }
  };

  const handleAddManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newContact.trim()) return;

    setIsSavingLead(true);
    const tenantSlug = activeTenant?.slug || "default";
    const cleanedEmail = newEmail.trim();

    const payload = {
      tenantSlug,
      companyName: newCompany.trim(),
      contactName: newContact.trim(),
      contactEmail: cleanedEmail,
      contactPhone: newPhone.trim(),
      industry: newIndustry.trim(),
      location: newLocation.trim(),
      assignedRep: assignedCloser.startsWith("Auto-Assign") ? "Auto-Assign (Least-Loaded)" : assignedCloser,
      icpFitScore: 88,
      buyingSignals: ["Direct Manual Inbound"],
      status: "CURIOUS" as const,
      source: "Manual Staff Entry",
    };

    try {
      const res = await crmFetch("/api/erp/crm/leads", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.lead) {
        throw new Error(data?.error || `Server responded with status ${res.status}`);
      }

      const createdLead: CrmLead = {
        ...data.lead,
        tenantSlug: data.lead.tenantSlug || tenantSlug,
        companyName: data.lead.companyName || data.lead.company || payload.companyName,
        contactName: data.lead.contactName || data.lead.name || payload.contactName,
        contactEmail: data.lead.contactEmail || data.lead.email || payload.contactEmail,
        contactPhone: data.lead.contactPhone || data.lead.phone || payload.contactPhone,
        industry: data.lead.industry || payload.industry,
        location: data.lead.location || payload.location,
        assignedRep: data.lead.assignedRep || data.lead.owner || (assignedCloser.startsWith("Auto-Assign") ? availableClosers[0]?.name || "Senior Sales Specialist" : assignedCloser),
        icpFitScore: Number(data.lead.icpFitScore || data.lead.score) || 88,
        buyingSignals: Array.isArray(data.lead.buyingSignals) && data.lead.buyingSignals.length > 0
          ? data.lead.buyingSignals
          : payload.buyingSignals,
        status: data.lead.status || payload.status,
        source: data.lead.source || payload.source,
        createdAt: data.lead.createdAt || new Date().toISOString(),
      };

      setLeads((prev) => {
        const filtered = prev.filter((l) => l.id !== createdLead.id);
        return [createdLead, ...filtered];
      });

      setIsAddModalOpen(false);
      setNewCompany("");
      setNewContact("");
      setNewEmail("");
      setNewPhone("");
      setNewIndustry("Corporate");
      setNewLocation("Lagos");
      setAssignedCloser("Auto-Assign (Least-Loaded)");
    } catch (err: any) {
      console.error("[Leads] Server save failed, preserving optimistic lead locally:", err);
      const localLead: CrmLead = {
        id: `LED-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        ...payload,
        assignedRep: assignedCloser.startsWith("Auto-Assign")
          ? availableClosers[0]?.name || "Senior Sales Specialist"
          : assignedCloser,
        createdAt: new Date().toISOString(),
      };
      setLeads((prev) => [localLead, ...prev]);

      setIsAddModalOpen(false);
      setNewCompany("");
      setNewContact("");
      setNewEmail("");
      setNewPhone("");
      setNewIndustry("Corporate");
      setNewLocation("Lagos");
      setAssignedCloser("Auto-Assign (Least-Loaded)");
    } finally {
      setIsSavingLead(false);
    }
  };


  const handleUpdateDealStage = async (dealId: string, lead: CrmLead, newStage: CrmDeal["stage"]) => {
    const newProb =
      newStage === "WON"
        ? 100
        : newStage === "NEGOTIATION"
        ? 85
        : newStage === "QUALIFIED"
        ? 50
        : newStage === "PROPOSAL"
        ? 40
        : 20;

    const targetKey = dealId || lead.id;
    setUpdatingDealStageId(targetKey);

    // Optimistic UI updates
    if (dealId) {
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage: newStage, probability: newProb } : d))
      );
    }
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, dealStage: newStage } : l))
    );

    try {
      if (dealId) {
        await crmFetch("/api/erp/crm/deals", {
          method: "PATCH",
          body: JSON.stringify({
            id: dealId,
            stage: newStage,
            probability: newProb,
          }),
        });
      } else {
        const res = await crmFetch("/api/erp/crm/deals", {
          method: "POST",
          body: JSON.stringify({
            title: `${lead.companyName} Commercial Contract`,
            company: lead.companyName,
            contactName: lead.contactName,
            email: lead.contactEmail,
            phone: lead.contactPhone || "",
            value: "₦0",
            stage: newStage,
            owner: lead.assignedRep || "Senior Account Exec",
            probability: newProb,
            leadId: lead.id,
          }),
        });
        const data = await res.json();
        if (data?.deal) {
          setDeals((prev) => [data.deal, ...prev]);
          await crmFetch("/api/erp/crm/leads", {
            method: "PATCH",
            body: JSON.stringify({
              id: lead.id,
              status: "PROPOSAL",
              convertedDealId: data.deal.id,
            }),
          });
        }
      }
    } catch (err: any) {
      console.warn("Error updating deal stage:", err);
    } finally {
      setUpdatingDealStageId(null);
    }
  };

  const handlePromoteToDeal = async (lead: CrmLead) => {
    setIsPromotingId(lead.id);
    try {
      const res = await crmFetch("/api/erp/crm/deals", {
        method: "POST",
        body: JSON.stringify({
          title: `${lead.companyName} Commercial Contract`,
          company: lead.companyName,
          contactName: lead.contactName,
          email: lead.contactEmail,
          phone: lead.contactPhone || "",
          value: "₦0",
          stage: "LEAD",
          owner: lead.assignedRep || "Senior Account Exec",
          probability: 20,
          expectedClose: "TBD",
          leadId: lead.id,
          notes: `Promoted from lead ${lead.id}. Signals: ${(lead.buyingSignals || []).join(", ")}`,
        }),
      });
      const data = await res.json();
      const newDeal = data?.deal;
      const dealId = newDeal?.id;

      if (newDeal) {
        setDeals((prev) => [newDeal, ...prev]);
      }

      // Persist status change in DB
      await crmFetch("/api/erp/crm/leads", {
        method: "PATCH",
        body: JSON.stringify({
          id: lead.id,
          status: "PROPOSAL",
          convertedDealId: dealId,
        }),
      });

      // Update local lead status
      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? { ...l, status: "PROPOSAL", convertedDealId: dealId, dealStage: "LEAD" }
            : l
        )
      );
    } catch {
      alert("Promoted to CRM Deal (local pipeline updated).");
    } finally {
      setIsPromotingId(null);
    }
  };

  const exportLeadsToCSV = () => {
    const targetLeads = filteredLeads.length > 0 ? filteredLeads : leads;
    if (!targetLeads.length) {
      alert("No leads available to export.");
      return;
    }

    const headers = [
      "Company Name",
      "Decision Maker Contact",
      "Contact Email",
      "Contact Phone",
      "LinkedIn Profile",
      "Lead Status",
      "Deal Stage",
      "Sales Closer / Rep",
      "ICP Fit Score",
      "Lead Source",
      "Call Logger Status",
      "Buying Signals & Notes",
      "Created Date",
    ];

    const escapeCsv = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;

    const rows = targetLeads.map((lead) => {
      const deal = getDealForLead(lead);
      const isDealConverted = Boolean(deal || (lead.convertedDealId && lead.dealStage));
      const dealStage = isDealConverted
        ? (deal?.stage || lead.dealStage || "LEAD")
        : "Not Promoted";

      const call = getLeadCallInfo(lead);
      const callInd = getCallIndicator(call, lead);
      let callStatusText = "Not Logged";
      if (callInd.color === "green") callStatusText = `Interested (${callInd.label})`;
      else if (callInd.color === "yellow") callStatusText = `Follow-Up (${callInd.label})`;
      else if (callInd.color === "red") callStatusText = "Not Interested";
      else if (callInd.color === "orange") callStatusText = "Wrong Number";
      else if (callInd.color === "blue") callStatusText = "Not on Call Logger";

      const signals = (lead.buyingSignals && lead.buyingSignals.length > 0)
        ? lead.buyingSignals.join(" | ")
        : (lead.notes || "");

      return [
        escapeCsv(lead.companyName),
        escapeCsv(lead.contactName),
        escapeCsv(lead.contactEmail),
        escapeCsv(lead.contactPhone || (lead as any).phone || ""),
        escapeCsv(lead.linkedinUrl || ""),
        escapeCsv(lead.status),
        escapeCsv(dealStage),
        escapeCsv(lead.assignedRep || (lead as any).owner || "Unassigned"),
        lead.icpFitScore ?? (lead as any).score ?? 75,
        escapeCsv(lead.source || "Direct Outreach"),
        escapeCsv(callStatusText),
        escapeCsv(signals),
        escapeCsv(lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ""),
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `crm-leads-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteLead = async (id: string, company: string) => {
    if (!confirm(`Are you sure you want to delete lead "${company}"?`)) return;
    setIsDeletingId(id);
    try {
      const res = await crmFetch(`/api/erp/crm/leads?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Failed to delete lead");
      }
    } catch (err: any) {
      alert("Error deleting lead: " + (err?.message || "Unknown error"));
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleUpdateLeadField = async (
    leadId: string,
    updates: { status?: string; assignedRep?: string; notes?: string }
  ) => {
    const targetLead = leads.find((l) => l.id === leadId);

    setUpdatingLeadId(leadId);
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? ({ ...l, ...updates } as any) : l))
    );

    try {
      const res = await crmFetch("/api/erp/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leadId,
          ...updates,
        }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.lead) {
          setLeads((prev) =>
            prev.map((l) =>
              l.id === leadId ? { ...l, ...data.lead } : l
            )
          );
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData?.error || "Failed to update lead");
        if (targetLead) {
          setLeads((prev) => prev.map((l) => (l.id === leadId ? targetLead : l)));
        }
      }
    } catch (err: any) {
      console.error("Error updating lead field:", err);
      alert("Error updating lead: " + (err?.message || "Network error"));
      if (targetLead) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? targetLead : l)));
      }
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const handleOpenEditModal = (lead: CrmLead) => {
    setEditingLead(lead);
    setEditStatus(lead.status || "CURIOUS");
    setEditAssignedCloser(lead.assignedRep || "Unassigned");
    setEditCompany(lead.companyName || (lead as any).company || "");
    setEditContact(lead.contactName || (lead as any).name || "");
    setEditEmail(lead.contactEmail || (lead as any).email || "");
    setEditPhone(lead.contactPhone || (lead as any).phone || "");
    setEditLinkedinUrl(lead.linkedinUrl || (lead as any).linkedin || "");
    setEditNotes(lead.notes || "");
    setIsEditModalOpen(true);
  };

  const handleSaveEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    setIsSavingEdit(true);

    const payload = {
      id: editingLead.id,
      companyName: editCompany.trim(),
      contactName: editContact.trim(),
      contactEmail: editEmail.trim(),
      contactPhone: editPhone.trim(),
      linkedinUrl: editLinkedinUrl.trim(),
      status: editStatus,
      assignedRep: editAssignedCloser === "Unassigned" ? "" : editAssignedCloser,
      notes: editNotes.trim(),
    };

    try {
      const res = await crmFetch("/api/erp/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || `Failed to update lead (HTTP ${res.status})`);
      }

      const data = await res.json().catch(() => null);
      const resolvedRep =
        data?.lead?.assignedRep || (editAssignedCloser === "Unassigned" ? "" : editAssignedCloser);

      setLeads((prev) =>
        prev.map((l) =>
          l.id === editingLead.id
            ? {
                ...l,
                companyName: editCompany.trim(),
                contactName: editContact.trim(),
                contactEmail: editEmail.trim(),
                contactPhone: editPhone.trim(),
                linkedinUrl: editLinkedinUrl.trim(),
                status: editStatus as any,
                assignedRep: resolvedRep,
                notes: editNotes.trim(),
              }
            : l
        )
      );
      setIsEditModalOpen(false);
      setEditingLead(null);
    } catch (err: any) {
      alert("Failed to update lead: " + (err?.message || "Unknown error"));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const missingPhoneCount = useMemo(() => {
    return leads.filter((l) => isPhoneMissingOrInvalid(l.contactPhone || (l as any).phone)).length;
  }, [leads]);

  const handleStartPhoneEnrich = async (lead: CrmLead, customQuery?: string) => {
    setEnrichingLead(lead);
    setIsEnrichModalOpen(true);
    setEnrichStatus("searching");
    setEnrichCandidates([]);
    setSelectedPhone("");
    setCustomPhoneInput("");
    setEnrichErrorMessage("");
    const query = customQuery || lead.companyName || (lead as any).company || "";
    setEnrichSearchQuery(query);

    try {
      const res = await crmFetch("/api/erp/crm/leads/enrich-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          companyName: query,
          location: lead.location,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setEnrichStatus("error");
        setEnrichErrorMessage(json.error || "Failed to search for phone numbers.");
        return;
      }

      const candidates: PhoneCandidate[] = json.data?.candidates || [];
      setEnrichCandidates(candidates);

      if (candidates.length > 0) {
        setEnrichStatus("success");
        setSelectedPhone(candidates[0].formattedPhone || candidates[0].phone);
      } else {
        setEnrichStatus("empty");
        setEnrichErrorMessage("No verified corporate phone numbers found for this company online.");
      }
    } catch (err: any) {
      setEnrichStatus("error");
      setEnrichErrorMessage(err.message || "Network error while searching for phone numbers.");
    }
  };

  const handleApplyEnrichedPhone = async (callAfter = false) => {
    if (!enrichingLead) return;
    const finalPhone = (customPhoneInput.trim() || selectedPhone.trim());
    if (!finalPhone) return;

    setIsApplyingPhone(true);
    setEnrichErrorMessage("");

    try {
      const chosenCand = enrichCandidates.find(
        (c) => c.formattedPhone === selectedPhone || c.phone === selectedPhone
      );
      const sourceNote = chosenCand
        ? `${chosenCand.sourceName} (${chosenCand.confidence}% confidence)`
        : "Manual Verification via AI Phone Intelligence";

      const res = await crmFetch("/api/erp/crm/leads/apply-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: enrichingLead.id,
          phone: finalPhone,
          sourceNote,
          website: chosenCand?.website,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setEnrichErrorMessage(data.message || data.error || "Failed to apply phone number.");
        setIsApplyingPhone(false);
        return;
      }

      // Update leads state with updated contact
      setLeads((prev) =>
        prev.map((l) =>
          l.id === enrichingLead.id
            ? {
                ...l,
                contactPhone: data.lead?.contactPhone || finalPhone,
                website: data.lead?.website || l.website,
                notes: data.lead?.notes || l.notes,
              }
            : l
        )
      );

      const targetLeadId = enrichingLead.id;
      const targetCompany = enrichingLead.companyName;
      const targetContact = enrichingLead.contactName;
      const targetRep = enrichingLead.assignedRep;

      setIsEnrichModalOpen(false);
      setEnrichingLead(null);

      if (callAfter) {
        window.location.href = `/erp/admin/crm/calls?leadId=${targetLeadId}&phone=${encodeURIComponent(finalPhone)}&name=${encodeURIComponent(targetContact || "")}&company=${encodeURIComponent(targetCompany || "")}${targetRep ? `&rep=${encodeURIComponent(targetRep)}` : ""}`;
      }
    } catch (err: any) {
      setEnrichErrorMessage(err.message || "Error updating lead in database.");
    } finally {
      setIsApplyingPhone(false);
    }
  };

  const handleCopyPhone = (num: string) => {
    navigator.clipboard?.writeText(num);
    setCopiedPhone(num);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const callCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: leads.length, green: 0, yellow: 0, red: 0, orange: 0, blue: 0 };
    for (const l of leads) {
      const c = getLeadCallInfo(l);
      const ind = getCallIndicator(c, l);
      counts[ind.color] = (counts[ind.color] || 0) + 1;
    }
    return counts;
  }, [leads, latestCallByLead]);

  const allRepOptions = useMemo(() => {
    const set = new Set<string>();
    availableClosers.forEach((c) => {
      const name = c.name?.trim();
      if (name && name !== "Unassigned" && !name.startsWith("Auto-Assign")) {
        set.add(name);
      }
    });
    leads.forEach((l) => {
      const rep = (l.assignedRep || (l as any).owner || "").trim();
      if (rep && rep !== "Unassigned" && !rep.startsWith("Auto-Assign")) {
        set.add(rep);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [availableClosers, leads]);

  const repCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: leads.length, UNASSIGNED: 0 };
    for (const l of leads) {
      const rep = (l.assignedRep || (l as any).owner || "").trim();
      if (!rep || rep === "Unassigned" || rep.startsWith("Auto-Assign")) {
        counts.UNASSIGNED = (counts.UNASSIGNED || 0) + 1;
      } else {
        counts[rep] = (counts[rep] || 0) + 1;
      }
    }
    return counts;
  }, [leads]);

  const filteredLeads = leads.filter((l) => {
    const q = searchQuery.toLowerCase();
    const cName = (l.companyName || (l as any).company || "").toLowerCase();
    const personName = (l.contactName || (l as any).name || "").toLowerCase();
    const email = (l.contactEmail || (l as any).email || "").toLowerCase();
    const loc = (l.location || "").toLowerCase();
    const phone = (l.contactPhone || (l as any).phone || "").toLowerCase();
    const audList = (l.audienceList || (l as any).listName || "").toLowerCase();
    const matchSearch =
      cName.includes(q) ||
      personName.includes(q) ||
      email.includes(q) ||
      loc.includes(q) ||
      phone.includes(q) ||
      audList.includes(q);
    const matchStatus = statusFilter === "ALL" || l.status === statusFilter;

    let matchCallStatus = true;
    if (callStatusFilter !== "ALL") {
      const c = getLeadCallInfo(l);
      const ind = getCallIndicator(c, l);
      matchCallStatus = ind.color === callStatusFilter;
    }

    let matchRep = true;
    if (repFilter !== "ALL") {
      const rep = (l.assignedRep || (l as any).owner || "").trim();
      if (repFilter === "UNASSIGNED") {
        matchRep = !rep || rep === "Unassigned" || rep.startsWith("Auto-Assign");
      } else {
        matchRep = rep.toLowerCase() === repFilter.toLowerCase();
      }
    }

    let matchPhone = true;
    if (phoneFilter === "MISSING") {
      matchPhone = isPhoneMissingOrInvalid(l.contactPhone || (l as any).phone);
    }

    return matchSearch && matchStatus && matchCallStatus && matchRep && matchPhone;
  });

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, callStatusFilter, repFilter, phoneFilter]);

  const totalItems = filteredLeads.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLeads.slice(startIndex, startIndex + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  return (
    <ErpAdminShell
      title="CRM Leads Directory & Intelligence"
      subtitle="Discover and score high-ACV commercial accounts, track buying signals, and 1-click convert into deals."
      activeModule="crm"
      action={
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/erp/admin/crm/calls">
            <NexaButton variant="secondary" className="gap-2 text-xs">
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              Call Logger
            </NexaButton>
          </Link>
          <NexaButton
            variant="secondary"
            className="gap-2 text-xs"
            onClick={exportLeadsToCSV}
            disabled={isLoading || leads.length === 0}
            title={
              filteredLeads.length !== leads.length
                ? `Export ${filteredLeads.length} filtered leads to CSV`
                : "Export all leads to CSV"
            }
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Export CSV{filteredLeads.length !== leads.length ? ` (${filteredLeads.length})` : ""}
            </span>
          </NexaButton>
          <NexaButton
            variant="secondary"
            className="gap-2 text-xs"
            onClick={() => setIsExtractModalOpen(true)}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Extract Leads with AI
          </NexaButton>
          <NexaButton
            variant="secondary"
            className="gap-2 text-xs"
            onClick={() => handleOpenCoverLetter(null)}
            title="Generate executive proposal cover letter on official tenant letterhead"
          >
            <Mail className="w-3.5 h-3.5 text-blue-500" />
            Cover Letter
          </NexaButton>
          <NexaButton
            variant="primary"
            className="gap-2 text-xs"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Prospect
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        <ErpStatGrid
          stats={[
            {
              label: "Total Enriched Prospects",
              value: leads.length.toString(),
              change: "All verified corporate contacts",
              changeType: "success",
              icon: <Target className="w-4 h-4 text-purple-500" />,
            },
            {
              label: "High ICP Fit (>90%)",
              value: leads.filter((l) => (l.icpFitScore ?? (l as any).score ?? 75) >= 90).length.toString(),
              change: "Prime buyer readiness",
              changeType: "success",
              icon: <Flame className="w-4 h-4 text-rose-500" />,
            },
            {
              label: "Assigned to Closers",
              value: `${leads.length - (repCounts.UNASSIGNED || 0)} / ${leads.length}`,
              change: `${repCounts.UNASSIGNED || 0} unassigned`,
              changeType: (repCounts.UNASSIGNED || 0) > 0 ? "warning" : "success",
              icon: <UserCheck className="w-4 h-4 text-blue-500" />,
            },
            {
              label: "Meetings Booked",
              value: leads.filter((l) => l.status === "MEETING_BOOKED").length.toString(),
              change: "Direct rep handoffs",
              changeType: "success",
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            },
          ]}
        />

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-2xl flex-wrap sm:flex-nowrap">
            <div className="flex-1 min-w-[200px]">
              <NexaInput
                placeholder="Search company, contact, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            {/* Rep Dropdown Filter */}
            <div className="relative">
              <select
                value={repFilter}
                onChange={(e) => setRepFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl text-xs font-semibold border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] hover:border-[#1A56DB]/50 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1A56DB] shrink-0"
                title="Filter by Assigned Sales Closer / Rep"
              >
                <option value="ALL">All Reps ({repCounts.ALL || 0})</option>
                <option value="UNASSIGNED">Unassigned ({repCounts.UNASSIGNED || 0})</option>
                {allRepOptions.map((rep) => (
                  <option key={rep} value={rep}>
                    👤 {rep} ({repCounts[rep] || 0})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--nexa-text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Call Status Dropdown Filter */}
            <div className="relative">
              <select
                value={callStatusFilter}
                onChange={(e) => setCallStatusFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl text-xs font-semibold border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] hover:border-[#1A56DB]/50 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1A56DB] shrink-0"
                title="Filter by Call Status"
              >
                <option value="ALL">All Call Statuses ({callCounts.ALL})</option>
                <option value="green">🟢 Interested, Proposal, Won ({callCounts.green})</option>
                <option value="yellow">🟡 Callback, Busy, Voicemail ({callCounts.yellow})</option>
                <option value="red">🔴 Not Interested ({callCounts.red})</option>
                <option value="orange">🟠 Wrong Number ({callCounts.orange})</option>
                <option value="blue">🔵 Not on Call Logger ({callCounts.blue})</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--nexa-text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setPhoneFilter((prev) => (prev === "MISSING" ? "ALL" : "MISSING"))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                phoneFilter === "MISSING"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-[var(--nexa-bg-base)] text-amber-600 dark:text-amber-400 hover:text-amber-500 border border-amber-500/30"
              }`}
              title="Filter contacts missing phone numbers"
            >
              <Sparkles className={`w-3.5 h-3.5 ${phoneFilter === "MISSING" ? "text-white" : "text-amber-500"}`} />
              <span>Needs Phone ({missingPhoneCount})</span>
            </button>
            {["ALL", "CURIOUS", "IDENTIFIED", "CONTACTED", "PROPOSAL", "MEETING_BOOKED", "QUALIFIED", "CONVERTED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  statusFilter === st
                    ? "bg-[#1A56DB] text-white shadow-xs"
                    : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] border border-[var(--nexa-border)]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Call Logger Status Filter Chips */}
        <div className="flex items-center gap-2 text-xs text-[var(--nexa-text-muted)] flex-wrap px-1">
          {repFilter !== "ALL" && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-[#1A56DB]/10 text-[#1A56DB] border border-[#1A56DB]/20">
              <UserCheck className="w-3.5 h-3.5 text-[#1A56DB]" />
              <span>Rep: {repFilter === "UNASSIGNED" ? "Unassigned" : repFilter}</span>
              <button
                type="button"
                onClick={() => setRepFilter("ALL")}
                className="hover:text-rose-600 ml-0.5 text-sm leading-none font-extrabold cursor-pointer"
                title="Clear rep filter"
              >
                ×
              </button>
            </div>
          )}

          <span className="font-bold text-[var(--nexa-text-secondary)] flex items-center gap-1.5 mr-1">
            <PhoneCall className="w-3.5 h-3.5 text-[#1A56DB]" /> Call Status:
          </span>

          <button
            type="button"
            onClick={() => setCallStatusFilter("ALL")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              callStatusFilter === "ALL"
                ? "bg-[#1A56DB] text-white shadow-xs"
                : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] border border-[var(--nexa-border)]"
            }`}
          >
            <span>All Calls</span>
            <span className="text-[10px] opacity-80 font-normal">({callCounts.ALL})</span>
          </button>

          <button
            type="button"
            onClick={() => setCallStatusFilter(callStatusFilter === "green" ? "ALL" : "green")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              callStatusFilter === "green"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
            }`}
            title="Filter by Interested, Proposal, Deal Won"
          >
            <span className={`w-2 h-2 rounded-full ${callStatusFilter === "green" ? "bg-white" : "bg-emerald-500"}`} />
            <span>Interested, Proposal, Won</span>
            <span className="text-[10px] opacity-80 font-normal">({callCounts.green})</span>
          </button>

          <button
            type="button"
            onClick={() => setCallStatusFilter(callStatusFilter === "yellow" ? "ALL" : "yellow")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              callStatusFilter === "yellow"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
            }`}
            title="Filter by Callback, No Answer, Busy, Voicemail"
          >
            <span className={`w-2 h-2 rounded-full ${callStatusFilter === "yellow" ? "bg-white" : "bg-amber-500"}`} />
            <span>Callback, No Answer, Busy</span>
            <span className="text-[10px] opacity-80 font-normal">({callCounts.yellow})</span>
          </button>

          <button
            type="button"
            onClick={() => setCallStatusFilter(callStatusFilter === "red" ? "ALL" : "red")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              callStatusFilter === "red"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
            }`}
            title="Filter by Not Interested"
          >
            <span className={`w-2 h-2 rounded-full ${callStatusFilter === "red" ? "bg-white" : "bg-rose-500"}`} />
            <span>Not Interested</span>
            <span className="text-[10px] opacity-80 font-normal">({callCounts.red})</span>
          </button>

          <button
            type="button"
            onClick={() => setCallStatusFilter(callStatusFilter === "orange" ? "ALL" : "orange")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              callStatusFilter === "orange"
                ? "bg-orange-600 text-white border-orange-600 shadow-xs"
                : "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20 hover:bg-orange-500/20"
            }`}
            title="Filter by Wrong Number"
          >
            <span className={`w-2 h-2 rounded-full ${callStatusFilter === "orange" ? "bg-white" : "bg-orange-500"}`} />
            <span>Wrong Number</span>
            <span className="text-[10px] opacity-80 font-normal">({callCounts.orange})</span>
          </button>

          <button
            type="button"
            onClick={() => setCallStatusFilter(callStatusFilter === "blue" ? "ALL" : "blue")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              callStatusFilter === "blue"
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
            }`}
            title="Filter by Not on Call Logger"
          >
            <span className={`w-2 h-2 rounded-full ${callStatusFilter === "blue" ? "bg-white" : "bg-blue-500"}`} />
            <span>Not on Call Logger</span>
            <span className="text-[10px] opacity-80 font-normal">({callCounts.blue})</span>
          </button>

          {(callStatusFilter !== "ALL" || repFilter !== "ALL" || statusFilter !== "ALL" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setCallStatusFilter("ALL");
                setRepFilter("ALL");
                setStatusFilter("ALL");
                setSearchQuery("");
              }}
              className="text-xs font-bold text-[#1A56DB] hover:underline cursor-pointer ml-1"
            >
              Reset filters
            </button>
          )}
        </div>

        <NexaCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-surface)] border-b border-[var(--nexa-border)] font-bold text-[var(--nexa-text-muted)]">
                <tr>
                  <th className="py-3 px-4">Company & ICP Fit</th>
                  <th className="py-3 px-4">Decision Maker Contact</th>
                  <th className="py-3 px-4">Buying Signals</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span>Assigned Rep</span>
                      {repFilter !== "ALL" && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1A56DB] text-white">
                          Filtered
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-xs text-[var(--nexa-text-muted)]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-[#1A56DB]" />
                        <span>Loading sales call logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs text-[var(--nexa-text-muted)]">
                      <div>No leads found matching criteria.</div>
                      {(statusFilter !== "ALL" || callStatusFilter !== "ALL" || repFilter !== "ALL" || searchQuery) && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setStatusFilter("ALL");
                              setCallStatusFilter("ALL");
                              setRepFilter("ALL");
                              setSearchQuery("");
                            }}
                            className="text-xs font-bold text-[#1A56DB] hover:underline cursor-pointer"
                          >
                            Clear all filters
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[var(--nexa-bg-surface)]/50 transition-colors">
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[var(--nexa-text-primary)]">{lead.companyName}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Flame className="w-3 h-3 text-amber-500" />
                          {lead.icpFitScore ?? (lead as any).score ?? 75}% ICP
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-[var(--nexa-text-muted)] shrink-0" />
                          {(() => {
                            const p = lead.contactPhone || (lead as any).phone;
                            const isMissing = isPhoneMissingOrInvalid(p);
                            if (isMissing) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => handleStartPhoneEnrich(lead)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer group"
                                  title="AI Search & Enrich missing phone number"
                                >
                                  <Sparkles className="w-2.5 h-2.5 text-amber-500 group-hover:rotate-12 transition-transform" />
                                  <span>Find Phone</span>
                                </button>
                              );
                            }
                            return (
                              <div className="inline-flex items-center gap-1">
                                <a
                                  href={`tel:${p}`}
                                  className="hover:underline hover:text-[#1A56DB]"
                                >
                                  {p}
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleStartPhoneEnrich(lead)}
                                  className="p-0.5 text-[var(--nexa-text-muted)] hover:text-amber-500 transition-colors cursor-pointer"
                                  title="AI Search alternative/verified phone number"
                                >
                                  <Sparkles className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            );
                          })()}

                          {/* LinkedIn Button directly after phone number - strictly renders ONLY if an actual LinkedIn profile URL exists */}
                          {(() => {
                            const raw = (lead.linkedinUrl || (lead as any).linkedin || "").trim();
                            if (!raw || raw.includes("/search/results") || raw.includes("keywords=")) return null;
                            const linkedinTarget = raw.startsWith("http") ? raw : `https://${raw}`;
                            return (
                              <a
                                href={linkedinTarget}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-[#0A66C2] bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/25 hover:border-[#0A66C2]/50 transition-all cursor-pointer shadow-2xs group shrink-0 ml-0.5"
                                title={`Open LinkedIn Profile: ${linkedinTarget}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <IconBrandLinkedin className="w-3 h-3 shrink-0 text-[#0A66C2]" />
                                <span>LinkedIn</span>
                              </a>
                            );
                          })()}
                        </span>
                        <span>•</span>
                        <span>{lead.industry}</span>
                      </div>
                      {((lead as any).audienceList || (lead as any).listName || (lead.source && lead.source.startsWith("Email Blast: "))) && (
                        <div className="flex items-center gap-1.5 text-[10.5px] text-blue-600 dark:text-blue-400 font-semibold pt-0.5">
                          <Users className="w-3 h-3 shrink-0 text-blue-500" />
                          <span className="truncate max-w-[220px]" title={`Audience List: ${(lead as any).audienceList || (lead as any).listName || lead.source?.replace("Email Blast: ", "")}`}>
                            {(lead as any).audienceList || (lead as any).listName || lead.source?.replace("Email Blast: ", "")}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="font-bold text-[var(--nexa-text-primary)]">{lead.contactName}</div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] truncate">{lead.contactTitle}</div>
                      <div className="text-[11px] text-[#1A56DB] flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {lead.contactEmail}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {(() => {
                        const count = getSignalItems(lead).length;
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSignalsLead(lead);
                              setIsSignalsModalOpen(true);
                            }}
                            className="relative p-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] hover:border-[#1A56DB] text-[var(--nexa-text-secondary)] hover:text-[#1A56DB] hover:bg-[#1A56DB]/5 transition-all cursor-pointer shadow-2xs group inline-flex items-center justify-center"
                            title={`Click to view ${count} buying signal event${count !== 1 ? "s" : ""} for ${lead.companyName}`}
                          >
                            <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:text-[#1A56DB] transition-colors" />
                            {count > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-extrabold bg-purple-600 text-white flex items-center justify-center ring-2 ring-[var(--nexa-bg-base)] shadow-xs">
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })()}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="relative inline-block">
                            <select
                              value={lead.status}
                              onChange={(e) =>
                                handleUpdateLeadField(lead.id, {
                                  status: e.target.value as any,
                                })
                              }
                              disabled={updatingLeadId === lead.id}
                              className="appearance-none pl-2.5 pr-6 py-1 rounded-lg text-xs font-semibold cursor-pointer border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:border-[#1A56DB]/50 transition-all focus:outline-none focus:ring-1 focus:ring-[#1A56DB] disabled:opacity-50"
                              title="Click to change lead status"
                            >
                              <option value="CURIOUS">CURIOUS</option>
                              <option value="IDENTIFIED">IDENTIFIED</option>
                              <option value="CONTACTED">CONTACTED</option>
                              <option value="PROPOSAL">PROPOSAL</option>
                              <option value="MEETING_BOOKED">MEETING_BOOKED</option>
                              <option value="QUALIFIED">QUALIFIED</option>
                              <option value="CONVERTED">CONVERTED</option>
                              <option value="ARCHIVED">ARCHIVED</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-[var(--nexa-text-muted)] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="relative inline-block min-w-[130px] max-w-[190px]">
                        <select
                          value={lead.assignedRep || ""}
                          onChange={(e) =>
                            handleUpdateLeadField(lead.id, {
                              assignedRep: e.target.value,
                            })
                          }
                          disabled={updatingLeadId === lead.id}
                          className="w-full appearance-none pl-2 pr-6 py-1 rounded-lg text-xs font-medium cursor-pointer border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] hover:border-[#1A56DB]/50 transition-all focus:outline-none focus:ring-1 focus:ring-[#1A56DB] disabled:opacity-50 truncate"
                          title="Click to assign sales closer"
                        >
                          <option value="">Unassigned</option>
                          <option value="Auto-Assign (Least-Loaded)">⚡ Auto-Assign</option>
                          {availableClosers.map((c) => (
                            <option key={c.email || c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                          {lead.assignedRep &&
                            lead.assignedRep !== "Unassigned" &&
                            !availableClosers.some((c) => c.name === lead.assignedRep) && (
                              <option value={lead.assignedRep}>
                                {lead.assignedRep}
                              </option>
                            )}
                        </select>
                        <ChevronDown className="w-3 h-3 text-[var(--nexa-text-muted)] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartPhoneEnrich(lead)}
                          className="p-1.5 rounded-lg border border-[var(--nexa-border)] hover:bg-amber-500/10 text-[var(--nexa-text-secondary)] hover:text-amber-500 transition-colors cursor-pointer"
                          title={`AI Phone Search for ${lead.companyName}`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(lead)}
                          className="p-1.5 rounded-lg border border-[var(--nexa-border)] hover:bg-[#1A56DB]/10 text-[var(--nexa-text-secondary)] hover:text-[#1A56DB] transition-colors cursor-pointer"
                          title={`Edit ${lead.companyName}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenCoverLetter(lead)}
                          className="p-1.5 rounded-lg border border-[var(--nexa-border)] hover:bg-[#1A56DB]/10 text-[var(--nexa-text-secondary)] hover:text-[#1A56DB] transition-colors cursor-pointer"
                          title={`Generate Proposal Cover Letter for ${lead.companyName}`}
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-500" />
                        </button>
                        {(() => {
                          const call = getLeadCallInfo(lead);
                          const ind = getCallIndicator(call, lead);
                          return (
                            <Link
                              href={`/erp/admin/crm/calls?leadId=${lead.id}&phone=${encodeURIComponent(lead.contactPhone || (lead as any).phone || "")}&name=${encodeURIComponent(lead.contactName || "")}&company=${encodeURIComponent(lead.companyName || "")}${lead.assignedRep ? `&rep=${encodeURIComponent(lead.assignedRep)}` : ""}`}
                              title={ind.tooltip}
                              className="relative p-1.5 rounded-lg border border-[var(--nexa-border)] hover:bg-[#1A56DB]/10 text-[var(--nexa-text-secondary)] hover:text-[#1A56DB] transition-colors flex items-center justify-center cursor-pointer"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span
                                className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${ind.dotClass} ring-2 ring-[var(--nexa-bg-surface)]`}
                              />
                            </Link>
                          );
                        })()}
                        {(() => {
                          const deal = getDealForLead(lead);
                          const isConverted = Boolean(deal || (lead.convertedDealId && lead.dealStage));
                          const currentStage: CrmDeal["stage"] =
                            deal?.stage || lead.dealStage || "LEAD";
                          const targetDealId = deal?.id || lead.convertedDealId || "";

                          if (!isConverted) {
                            return (
                              <button
                                type="button"
                                onClick={() => handlePromoteToDeal(lead)}
                                disabled={isPromotingId === lead.id}
                                className="px-2.5 py-1 rounded-lg bg-[#1A56DB]/10 text-[#1A56DB] hover:bg-[#1A56DB] hover:text-white font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                                title="Promote lead to pipeline deal with ₦0 value in Lead Discovery"
                              >
                                {isPromotingId === lead.id ? "Promoting..." : "Promote to Deal"}
                              </button>
                            );
                          }

                          const stageColorMap: Record<string, string> = {
                            LEAD: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30",
                            PROPOSAL: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
                            QUALIFIED: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
                            NEGOTIATION: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
                            WON: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
                            LOST: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
                          };

                          const currentBadgeStyle =
                            stageColorMap[currentStage] ||
                            "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30";

                          return (
                            <div className="relative inline-flex items-center">
                              <select
                                value={currentStage}
                                onChange={(e) =>
                                  handleUpdateDealStage(
                                    targetDealId,
                                    lead,
                                    e.target.value as CrmDeal["stage"]
                                  )
                                }
                                disabled={updatingDealStageId === (targetDealId || lead.id)}
                                className={`appearance-none text-[11px] font-bold pl-2.5 pr-6 py-1 rounded-lg border transition-all cursor-pointer outline-none ${currentBadgeStyle} hover:opacity-90 disabled:opacity-50`}
                                title="Deal Pipeline Stage: Click to update deal status"
                              >
                                <option value="LEAD">Lead Discovery</option>
                                <option value="PROPOSAL">Proposal / SLA</option>
                                <option value="QUALIFIED">Qualified</option>
                                <option value="NEGOTIATION">Negotiation</option>
                                <option value="WON">Contract Won</option>
                                <option value="LOST">Deal Lost</option>
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                            </div>
                          );
                        })()}
                        <button
                          type="button"
                          onClick={() => handleDeleteLead(lead.id, lead.companyName)}
                          disabled={isDeletingId === lead.id}
                          className="p-1.5 rounded-lg border border-[var(--nexa-border)] hover:bg-rose-500/10 text-[var(--nexa-text-secondary)] hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                          title={`Delete lead ${lead.companyName}`}
                        >
                          {isDeletingId === lead.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-500" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination Controller & Page Size Selector */}
          <div className="p-3 border-t border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[var(--nexa-text-muted)]">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-semibold text-[var(--nexa-text-primary)] focus:outline-none focus:ring-1 focus:ring-[#1A56DB] cursor-pointer"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={pageSize}
              onPageChange={setCurrentPage}
              className="pt-0 border-t-0"
            />
          </div>
        </NexaCard>
      </div>

      {/* AI EXTRACT LEADS MODAL */}
      <NexaModal
        isOpen={isExtractModalOpen}
        onClose={() => setIsExtractModalOpen(false)}
        title="AI Commercial Prospector Engine"
        subtitle="Extract targeted B2B enterprises matching your ideal buyer persona."
      >
        <form onSubmit={handleExtractLeads} className="space-y-4">
          <NexaInput
            label="Target Industry & Profile"
            value={extractQuery}
            onChange={(e) => setExtractQuery(e.target.value)}
            placeholder="e.g. Multi-store Supermarkets & Cold Chain logistics"
            required
          />

          <NexaInput
            label="Geographic Territory"
            value={extractLocation}
            onChange={(e) => setExtractLocation(e.target.value)}
            placeholder="e.g. Lagos, Abuja, Port Harcourt"
            required
          />

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Autonomous Verification Active
            </p>
            <p className="mt-1">
              The CRM prospector verifies executive contact info against public corporate registries and computes ICP fit scores automatically.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <NexaButton variant="secondary" type="button" onClick={() => setIsExtractModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton variant="primary" type="submit" disabled={isExtracting}>
              {isExtracting ? "Extracting & Scoring..." : "Run AI Extraction"}
            </NexaButton>
          </div>
        </form>
      </NexaModal>

      {/* ADD MANUAL PROSPECT MODAL */}
      <NexaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Lead Manually"
        subtitle="Record an inbound prospect into the CRM directory."
      >
        <form onSubmit={handleAddManualLead} className="space-y-4">
          <NexaInput
            label="Company Name"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            placeholder="e.g. Dangote Cement Logistics Division"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NexaInput
              label="Contact Name"
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
              placeholder="e.g. Alh. Sani Dangote"
              required
            />
            <NexaInput
              label="Contact Email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="sani@company.ng"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NexaInput
              label="Phone Number"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+2348030000000"
            />
            <NexaInput
              label="Territory / City"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="Victoria Island, Lagos"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--nexa-text-secondary)] mb-1.5">
              Sales Closer Assignment
            </label>
            <select
              value={assignedCloser}
              onChange={(e) => setAssignedCloser(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            >
              <option value="Auto-Assign (Least-Loaded)">⚡ Auto-Assign (Least-Loaded Closer)</option>
              {availableClosers.map((c) => (
                <option key={c.email || c.name} value={c.name}>
                  👤 {c.name} {c.email ? `(${c.email})` : ""}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-[var(--nexa-text-muted)]">
              Sales closers are staff accounts that have the Sales Closer portal enabled on their account.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <NexaButton variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton variant="primary" type="submit" disabled={isSavingLead}>
              {isSavingLead ? "Saving Lead..." : "Save Lead"}
            </NexaButton>
          </div>
        </form>
      </NexaModal>

      {/* EDIT LEAD MODAL */}
      <NexaModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLead(null);
        }}
        title="Edit Lead Profile & Assignment"
        subtitle="Update lead status, closer assignment, and contact details."
      >
        <form onSubmit={handleSaveEditLead} className="space-y-4">
          <NexaInput
            label="Company Name"
            value={editCompany}
            onChange={(e) => setEditCompany(e.target.value)}
            placeholder="Company name"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NexaInput
              label="Contact Name"
              value={editContact}
              onChange={(e) => setEditContact(e.target.value)}
              placeholder="Contact person name"
              required
            />
            <NexaInput
              label="Contact Email"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="contact@company.ng"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NexaInput
              label="Phone Number"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="+2348030000000"
            />
            <div>
              <label className="block text-xs font-semibold text-[var(--nexa-text-secondary)] mb-1.5">
                Lead Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
              >
                <option value="CURIOUS">CURIOUS</option>
                <option value="IDENTIFIED">IDENTIFIED</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="PROPOSAL">PROPOSAL</option>
                <option value="MEETING_BOOKED">MEETING_BOOKED</option>
                <option value="QUALIFIED">QUALIFIED</option>
                <option value="CONVERTED">CONVERTED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <NexaInput
            label="LinkedIn Profile URL"
            value={editLinkedinUrl}
            onChange={(e) => setEditLinkedinUrl(e.target.value)}
            placeholder="https://www.linkedin.com/in/prospect-profile"
            leftIcon={<IconBrandLinkedin className="w-4 h-4 text-[#0A66C2]" />}
          />

          <div>
            <label className="block text-xs font-semibold text-[var(--nexa-text-secondary)] mb-1.5">
              Assigned Sales Closer
            </label>
            <select
              value={editAssignedCloser}
              onChange={(e) => setEditAssignedCloser(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            >
              <option value="Unassigned">⭕ Unassigned</option>
              <option value="Auto-Assign (Least-Loaded)">⚡ Auto-Assign (Least-Loaded Closer)</option>
              {availableClosers.map((c) => (
                <option key={c.email || c.name} value={c.name}>
                  👤 {c.name} {c.email ? `(${c.email})` : ""}
                </option>
              ))}
              {editAssignedCloser &&
                editAssignedCloser !== "Unassigned" &&
                !availableClosers.some((c) => c.name === editAssignedCloser) && (
                  <option value={editAssignedCloser}>👤 {editAssignedCloser}</option>
                )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--nexa-text-secondary)] mb-1.5">
              Notes
            </label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Add key insights, deal notes, or next action items..."
              rows={3}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <NexaButton
              variant="secondary"
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingLead(null);
              }}
            >
              Cancel
            </NexaButton>
            <NexaButton variant="primary" type="submit" disabled={isSavingEdit}>
              {isSavingEdit ? "Saving..." : "Save Changes"}
            </NexaButton>
          </div>
        </form>
      </NexaModal>

      {/* BUYING SIGNALS TIMELINE MODAL */}
      <NexaModal
        isOpen={isSignalsModalOpen}
        onClose={() => {
          setIsSignalsModalOpen(false);
          setSelectedSignalsLead(null);
        }}
        title="Buying Signals & Intent Activity"
        subtitle={
          selectedSignalsLead
            ? `${selectedSignalsLead.companyName} • ${selectedSignalsLead.contactName || "Prospect Contact"}`
            : "Chronological intent triggers and buyer engagement signals."
        }
      >
        {selectedSignalsLead && (
          <div className="space-y-4">
            {/* Prospect Snapshot Header */}
            <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    {selectedSignalsLead.companyName}
                  </div>
                  <div className="text-[11px] text-[var(--nexa-text-muted)] flex items-center gap-1.5">
                    <span>{selectedSignalsLead.contactName}</span>
                    {selectedSignalsLead.industry && (
                      <>
                        <span>•</span>
                        <span>{selectedSignalsLead.industry}</span>
                      </>
                    )}
                    {selectedSignalsLead.location && (
                      <>
                        <span>•</span>
                        <span>{selectedSignalsLead.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  {selectedSignalsLead.icpFitScore ?? (selectedSignalsLead as any).score ?? 75}% ICP Fit
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1A56DB]/10 text-[#1A56DB] border border-[#1A56DB]/20">
                  {selectedSignalsLead.status}
                </span>
              </div>
            </div>

            {/* List of Buying Signal Events */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {getSignalItems(selectedSignalsLead).map((item, index) => {
                const isCall = item.eventType === "CALL";
                const isCampaign = item.eventType === "CAMPAIGN";
                const isAssignment = item.eventType === "ASSIGNMENT";

                const badgeStyle = isCall
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                  : isCampaign
                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                  : isAssignment
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                  : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";

                const badgeLabel = isCall
                  ? "Call Logger Disposition"
                  : isCampaign
                  ? "Email Campaign Trigger"
                  : isAssignment
                  ? "Closer Auto-Assignment"
                  : `Signal Event #${index + 1}`;

                const IconComponent = isCall ? PhoneCall : isCampaign ? Mail : isAssignment ? UserCheck : Activity;

                return (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] hover:border-[#1A56DB]/40 transition-all space-y-2 shadow-2xs"
                  >
                    {/* Event Time and Date Line */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-2.5 text-[var(--nexa-text-muted)]">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--nexa-text-secondary)]">
                          <Calendar className="w-3.5 h-3.5 text-[#1A56DB]" />
                          {item.eventDate}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--nexa-text-secondary)]">
                          <Clock className="w-3.5 h-3.5 text-[#1A56DB]" />
                          {item.eventTime}
                        </span>
                      </div>

                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${badgeStyle}`}>
                        <IconComponent className="w-3 h-3" />
                        {badgeLabel}
                      </span>
                    </div>

                    {/* Signal Item Description (Separate Line) */}
                    <div className="text-xs font-semibold text-[var(--nexa-text-primary)] leading-relaxed pl-0.5">
                      {item.text}
                    </div>

                    {/* Rich Call Metadata details if available */}
                    {item.callDetails && (
                      <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-[var(--nexa-border)] text-[11px] text-[var(--nexa-text-muted)]">
                        {item.callDetails.repName && (
                          <span>
                            Closer: <strong className="text-[var(--nexa-text-secondary)]">{item.callDetails.repName}</strong>
                          </span>
                        )}
                        {item.callDetails.callScore !== undefined && item.callDetails.callScore > 0 && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-extrabold bg-[#1A56DB]/10 text-[#1A56DB] border border-[#1A56DB]/25">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              Score: {item.callDetails.callScore}/12
                            </span>
                          </>
                        )}
                        {item.callDetails.durationSeconds !== undefined && item.callDetails.durationSeconds > 0 && (
                          <>
                            <span>•</span>
                            <span>
                              Duration: <strong className="text-[var(--nexa-text-secondary)]">
                                {Math.floor(item.callDetails.durationSeconds / 60)}m {item.callDetails.durationSeconds % 60}s
                              </strong>
                            </span>
                          </>
                        )}
                        {item.callDetails.direction && (
                          <>
                            <span>•</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-secondary)]">
                              {item.callDetails.direction}
                            </span>
                          </>
                        )}
                        {item.callDetails.recordingUrl && (
                          <>
                            <span>•</span>
                            <a
                              href={item.callDetails.recordingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#1A56DB] hover:underline font-semibold inline-flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Play Recording
                            </a>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-[var(--nexa-border)]">
              <span className="text-[11px] text-[var(--nexa-text-muted)]">
                {getSignalItems(selectedSignalsLead).length} detected signal event{getSignalItems(selectedSignalsLead).length !== 1 ? "s" : ""}
              </span>
              <NexaButton
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsSignalsModalOpen(false);
                  setSelectedSignalsLead(null);
                }}
              >
                Close
              </NexaButton>
            </div>
          </div>
        )}
      </NexaModal>

      {/* Interactive AI Phone Intelligence Modal */}
      <NexaModal
        isOpen={isEnrichModalOpen}
        onClose={() => {
          if (!isApplyingPhone) {
            setIsEnrichModalOpen(false);
            setEnrichingLead(null);
          }
        }}
        title="AI Phone Intelligence & Enrichment"
      >
        {enrichingLead && (
          <div className="space-y-4">
            {/* Lead Context Snapshot */}
            <div className="p-3.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] flex items-center justify-between gap-3 flex-wrap">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#1A56DB]" />
                  <span className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                    {enrichingLead.companyName}
                  </span>
                </div>
                <div className="text-xs text-[var(--nexa-text-muted)] flex items-center gap-2">
                  <span>Contact: <strong className="text-[var(--nexa-text-primary)]">{enrichingLead.contactName || "Corporate Executive"}</strong></span>
                  {enrichingLead.location && (
                    <>
                      <span>•</span>
                      <span>{enrichingLead.location}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-[var(--nexa-text-muted)] block">Current Phone:</span>
                {isPhoneMissingOrInvalid(enrichingLead.contactPhone || (enrichingLead as any).phone) ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Missing / Invalid
                  </span>
                ) : (
                  <span className="text-xs font-mono text-[var(--nexa-text-secondary)] font-semibold">
                    {enrichingLead.contactPhone || (enrichingLead as any).phone}
                  </span>
                )}
              </div>
            </div>

            {/* Error Banner */}
            {enrichErrorMessage && (
              <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{enrichErrorMessage}</div>
              </div>
            )}

            {/* Searching State */}
            {enrichStatus === "searching" && (
              <div className="py-8 px-4 text-center space-y-4">
                <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 animate-pulse shadow-sm">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                    Scanning Internet Intelligence...
                  </h4>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Querying Apify Google Places & Corporate Contact Directories for:
                  </p>
                  <p className="font-mono text-xs font-semibold text-[#1A56DB] bg-[#1A56DB]/5 py-1 px-3 rounded-lg inline-block border border-[#1A56DB]/20">
                    &quot;{enrichSearchQuery}&quot;
                  </p>
                </div>

                <div className="max-w-xs mx-auto space-y-1.5 text-left text-[11px] text-[var(--nexa-text-muted)] pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Scraping official Google Maps business profiles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>Inspecting corporate domain & leadership directories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <span>AI validating Nigerian E.164 phone switchboards</span>
                  </div>
                </div>
              </div>
            )}

            {/* Empty or Error with Query Override Box */}
            {(enrichStatus === "empty" || enrichStatus === "error") && (
              <div className="p-4 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/40 space-y-3">
                <div className="text-xs text-[var(--nexa-text-muted)]">
                  Try refining the search query (e.g. adding head office location, removing abbreviations):
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <NexaInput
                      placeholder="e.g. Prime Atlantic Cegelec Victoria Island Lagos"
                      value={enrichSearchQuery}
                      onChange={(e) => setEnrichSearchQuery(e.target.value)}
                    />
                  </div>
                  <NexaButton
                    type="button"
                    onClick={() => handleStartPhoneEnrich(enrichingLead, enrichSearchQuery)}
                  >
                    Search Again
                  </NexaButton>
                </div>

                <div className="pt-2 border-t border-[var(--nexa-border)] space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wide">
                    Or Enter Phone Number Manually:
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <NexaInput
                        placeholder="+234 802 000 0000"
                        value={customPhoneInput}
                        onChange={(e) => setCustomPhoneInput(e.target.value)}
                      />
                    </div>
                    <NexaButton
                      type="button"
                      variant="primary"
                      disabled={!customPhoneInput.trim() || isApplyingPhone}
                      onClick={() => handleApplyEnrichedPhone(false)}
                    >
                      {isApplyingPhone ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Save Phone"}
                    </NexaButton>
                  </div>
                </div>
              </div>
            )}

            {/* Candidates Selection List */}
            {enrichStatus === "success" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Discovered Verified Numbers ({enrichCandidates.length}):
                  </span>
                  <span className="text-[11px] text-[var(--nexa-text-muted)]">
                    Select a number to update contact
                  </span>
                </div>

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {enrichCandidates.map((cand, idx) => {
                    const isSelected =
                      selectedPhone === cand.formattedPhone || selectedPhone === cand.phone;
                    const isCopied = copiedPhone === cand.formattedPhone || copiedPhone === cand.phone;

                    const typeBadge =
                      cand.type === "HEAD_OFFICE_SWITCHBOARD"
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                        : cand.type === "DIRECT_MOBILE"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";

                    const typeLabel =
                      cand.type === "HEAD_OFFICE_SWITCHBOARD"
                        ? "Corporate HQ Switchboard"
                        : cand.type === "DIRECT_MOBILE"
                        ? "Mobile / WhatsApp"
                        : "Customer Support";

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedPhone(cand.formattedPhone);
                          setCustomPhoneInput("");
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? "border-[#1A56DB] bg-[#1A56DB]/5 ring-2 ring-[#1A56DB]/20"
                            : "border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] hover:border-[#1A56DB]/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="selectedCandidatePhone"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedPhone(cand.formattedPhone);
                                setCustomPhoneInput("");
                              }}
                              className="accent-[#1A56DB] w-4 h-4 cursor-pointer"
                            />
                            <span className="font-extrabold text-base font-mono text-[var(--nexa-text-primary)]">
                              {cand.formattedPhone}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyPhone(cand.formattedPhone);
                              }}
                              className="p-1 rounded text-[var(--nexa-text-muted)] hover:text-[#1A56DB] transition-colors"
                              title="Copy phone to clipboard"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${typeBadge}`}>
                              {typeLabel}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              {cand.confidence}% Match
                            </span>
                          </div>
                        </div>

                        {/* Source & Address Snippet */}
                        <div className="text-[11px] text-[var(--nexa-text-muted)] flex items-center justify-between gap-2 pt-1 border-t border-[var(--nexa-border)]/50">
                          <div className="flex items-center gap-1 truncate max-w-[280px]">
                            {cand.address ? (
                              <>
                                <MapPin className="w-3 h-3 shrink-0 text-[var(--nexa-text-muted)]" />
                                <span className="truncate" title={cand.address}>{cand.address}</span>
                              </>
                            ) : (
                              <span>Source: {cand.sourceName}</span>
                            )}
                          </div>

                          {cand.sourceUrl && (
                            <a
                              href={cand.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[#1A56DB] hover:underline font-semibold shrink-0"
                            >
                              <span>View Source</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Manual Override Input */}
                <div className="pt-2 border-t border-[var(--nexa-border)] space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--nexa-text-muted)]">
                    Or edit / override before applying:
                  </label>
                  <NexaInput
                    placeholder="e.g. +234 802 112 2334"
                    value={customPhoneInput}
                    onChange={(e) => {
                      setCustomPhoneInput(e.target.value);
                      setSelectedPhone("");
                    }}
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--nexa-border)] gap-2">
              <NexaButton
                variant="secondary"
                type="button"
                disabled={isApplyingPhone}
                onClick={() => {
                  setIsEnrichModalOpen(false);
                  setEnrichingLead(null);
                }}
              >
                Cancel
              </NexaButton>

              {(enrichStatus === "success" || customPhoneInput.trim()) && (
                <div className="flex items-center gap-2">
                  <NexaButton
                    type="button"
                    variant="secondary"
                    disabled={isApplyingPhone || (!selectedPhone && !customPhoneInput.trim())}
                    onClick={() => handleApplyEnrichedPhone(true)}
                    className="flex items-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Apply & Call Now</span>
                  </NexaButton>

                  <NexaButton
                    type="button"
                    variant="primary"
                    disabled={isApplyingPhone || (!selectedPhone && !customPhoneInput.trim())}
                    onClick={() => handleApplyEnrichedPhone(false)}
                    className="flex items-center gap-1.5"
                  >
                    {isApplyingPhone ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Apply to Contact</span>
                  </NexaButton>
                </div>
              )}
            </div>
          </div>
        )}
      </NexaModal>

      {/* MODAL: COVER LETTER GENERATOR TIED TO LEAD */}
      {isCoverLetterModalOpen && (
        <NexaModal
          isOpen={isCoverLetterModalOpen}
          onClose={() => setIsCoverLetterModalOpen(false)}
          maxWidth="5xl"
          title={
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#1A56DB]" />
              <span className="font-black text-base">Cover Letter Generator</span>
              {coverLetterLead && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] border border-[#1A56DB]/20">
                  {coverLetterLead.companyName || (coverLetterLead as any).company || "Lead"}
                </span>
              )}
            </div>
          }
          subtitle="Draft, customize and export official proposal cover letters tied to this prospect with live tenant letterhead and corporate footer."
        >
          <div className="space-y-6 max-h-[82vh] overflow-y-auto pr-1 p-1">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT: EDITING CONTROLS */}
              <div className="lg:col-span-5 space-y-4">
                {/* PROSPECT / LEAD SELECTOR */}
                <div>
                  <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                    Linked Lead (Prospect)
                  </label>
                  <select
                    value={coverLetterLead?.id || ""}
                    onChange={(e) => handleSwitchCoverLetterLead(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-medium text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                  >
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.companyName || (l as any).company || "Company"} — {l.contactName || (l as any).name || "Contact"} {l.contactTitle ? `(${l.contactTitle})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PRE-BUILT PROPOSAL TEMPLATES */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Pre-Built Proposal Templates</span>
                    </label>
                    <span className="text-[10px] text-[var(--nexa-text-muted)]">Click to apply</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {Object.entries(LEAD_COVER_LETTER_TEMPLATES).map(([key, tpl]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleApplyCoverLetterTemplate(key)}
                        className={`p-2 rounded-lg border text-left text-xs font-semibold transition-all cursor-pointer flex flex-col justify-between ${
                          activeTemplateKey === key
                            ? "bg-[#1A56DB]/10 border-[#1A56DB] text-[#1A56DB]"
                            : "bg-[var(--nexa-bg-surface)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:border-[var(--nexa-border)]/80"
                        }`}
                      >
                        <span className="truncate">{tpl.name}</span>
                        <span className="text-[9px] font-mono text-[var(--nexa-text-muted)] mt-0.5">
                          {tpl.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* DOCUMENT BADGE / TRANSMITTAL HEADER TITLE */}
                <div className="p-3.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[var(--nexa-text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>Header Document Badge</span>
                    </label>
                    <span className="text-[10px] text-[var(--nexa-text-muted)]">Top-right header title</span>
                  </div>
                  <input
                    type="text"
                    value={coverDocumentBadge}
                    onChange={(e) => setCoverDocumentBadge(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-semibold text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                    placeholder="e.g. OFFICIAL TRANSMITTAL"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {["OFFICIAL TRANSMITTAL", "COMMERCIAL PROPOSAL", "OFFICIAL CORRESPONDENCE", "TENDER TRANSMITTAL"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setCoverDocumentBadge(b)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          coverDocumentBadge === b
                            ? "bg-[#1A56DB] text-white"
                            : "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)] hover:border-[#1A56DB]/50"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* RECIPIENT PARTICULARS (Contact Name, Title, Company) */}
                <div className="p-3.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/60 space-y-3">
                  <div className="text-[11px] font-bold text-[var(--nexa-text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span>Recipient Particulars</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <NexaInput
                      label="Date"
                      value={coverLetterDate}
                      onChange={(e) => setCoverLetterDate(e.target.value)}
                      placeholder="e.g. 10th November, 2026"
                    />
                    <NexaInput
                      label="Contact Name"
                      value={coverRecipientName}
                      onChange={(e) => setCoverRecipientName(e.target.value)}
                      placeholder="e.g. Engr. Tunde Adeleke"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <NexaInput
                      label="Recipient Title"
                      value={coverRecipientTitle}
                      onChange={(e) => setCoverRecipientTitle(e.target.value)}
                      placeholder="e.g. Head of Procurement"
                    />
                    <NexaInput
                      label="Company"
                      value={coverRecipientCompany}
                      onChange={(e) => setCoverRecipientCompany(e.target.value)}
                      placeholder="e.g. Dangote Sugar Refinery Plc"
                    />
                  </div>

                  <NexaInput
                    label="Delivery Address / City"
                    value={coverRecipientAddress}
                    onChange={(e) => setCoverRecipientAddress(e.target.value)}
                    placeholder="e.g. Victoria Island / Commercial District, Lagos"
                    leftIcon={<MapPin className="w-3.5 h-3.5 text-[var(--nexa-text-muted)]" />}
                  />
                </div>

                {/* LETTER CONTENT */}
                <div className="space-y-3">
                  <NexaInput
                    label="Reference / Subject Line"
                    value={coverLetterReference}
                    onChange={(e) => setCoverLetterReference(e.target.value)}
                    placeholder="e.g. COMMERCIAL PROPOSAL & PARTNERSHIP OFFER"
                  />

                  <NexaInput
                    label="Salutation"
                    value={coverLetterSalutation}
                    onChange={(e) => setCoverLetterSalutation(e.target.value)}
                    placeholder="e.g. Dear Sir/Madam,"
                  />

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                        Letter Body Paragraphs
                      </label>
                      <span className="text-[10px] text-[var(--nexa-text-muted)]">
                        Separate paragraphs with blank lines
                      </span>
                    </div>
                    <textarea
                      value={coverLetterBody}
                      onChange={(e) => setCoverLetterBody(e.target.value)}
                      rows={8}
                      className="w-full p-3 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-normal text-[var(--nexa-text-primary)] focus:border-[#1A56DB] outline-none leading-relaxed"
                      placeholder="Enter the body paragraphs of your cover letter..."
                    />
                  </div>
                </div>

                {/* SIGNATORY BLOCK */}
                <div className="p-3.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/60 space-y-3">
                  <div className="text-[11px] font-bold text-[var(--nexa-text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Signatory & Sign-off Details</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <NexaInput
                      label="Sign-off Closing"
                      value={coverLetterSignoff}
                      onChange={(e) => setCoverLetterSignoff(e.target.value)}
                      placeholder="e.g. Yours faithfully,"
                    />
                    <NexaInput
                      label="Signatory Name"
                      value={coverSignatoryName}
                      onChange={(e) => setCoverSignatoryName(e.target.value)}
                      placeholder="e.g. Authorized Sales Representative"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <NexaInput
                      label="Signatory Title"
                      value={coverSignatoryTitle}
                      onChange={(e) => setCoverSignatoryTitle(e.target.value)}
                      placeholder="e.g. Commercial Director"
                    />
                    <NexaInput
                      label="Signatory Department"
                      value={coverSignatoryDepartment}
                      onChange={(e) => setCoverSignatoryDepartment(e.target.value)}
                      placeholder="e.g. Strategic Key Accounts"
                    />
                  </div>

                  <NexaInput
                    label="Contact Details / Email / Phone"
                    value={coverSignatoryContact}
                    onChange={(e) => setCoverSignatoryContact(e.target.value)}
                    placeholder="e.g. +234 800 000 0000 | ops@ofia.ng"
                  />
                </div>

                {/* TENANT FOOTER CUSTOMIZATION */}
                <div>
                  <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1">
                    Letterhead Footer (RC, TIN, Legal & Confidentiality Notes)
                  </label>
                  <input
                    type="text"
                    value={coverTenantFooter}
                    onChange={(e) => setCoverTenantFooter(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs text-[var(--nexa-text-primary)] focus:border-[#1A56DB] outline-none"
                    placeholder="e.g. RC 1892019 • Tax ID: 22001923-0001 • Victoria Island, Lagos"
                  />
                  <p className="text-[10px] text-[var(--nexa-text-muted)] mt-1">
                    Appears on the bottom footer of the paper letterhead in print and PDF.
                  </p>
                </div>
              </div>

              {/* RIGHT: LIVE A4 LETTERHEAD PAPER PREVIEW */}
              <div className="lg:col-span-7">
                <div className="sticky top-0 bg-slate-100/80 dark:bg-slate-900/80 p-3 sm:p-4 rounded-2xl border border-[var(--nexa-border)] space-y-3">
                  <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)] font-medium">
                    <div className="flex items-center gap-1.5 font-bold text-[var(--nexa-text-primary)]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Live Letterhead Paper Preview</span>
                    </div>
                    <div className="text-[10px] uppercase font-mono tracking-wider bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-[var(--nexa-border)]">
                      A4 Letterhead Standard
                    </div>
                  </div>

                  {/* Pristine White A4 Paper Sheet */}
                  <div
                    id="lead-cover-letter-paper-area"
                    className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-300/80 overflow-hidden min-h-[780px] flex flex-col justify-between select-text"
                  >
                    {/* TENANT LETTERHEAD HEADER WITH WHITE ABSTRACT DESIGN - FULL WIDTH COVERING TOP */}
                    <div className="relative overflow-hidden w-full bg-gradient-to-r from-[#0B1E3D] via-[#164DBF] to-[#1A56DB] px-6 sm:px-8 py-6 text-white shadow-xs border-b border-[#1A56DB]/40">
                      {/* Abstract White Background Pattern */}
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none select-none"
                        viewBox="0 0 760 140"
                        preserveAspectRatio="none"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <linearGradient id="leadAbsWhiteFade" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
                            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.04" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="leadAbsWaveFade" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.09" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M260,-20 C420,40 500,-10 640,60 C720,100 750,50 780,20 L780,-20 Z"
                          fill="url(#leadAbsWhiteFade)"
                        />
                        <path
                          d="M-40,140 C140,80 320,130 520,70 C660,30 720,80 780,50 L780,140 Z"
                          fill="url(#leadAbsWaveFade)"
                        />
                        <circle cx="710" cy="20" r="60" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1.2" />
                        <circle cx="710" cy="20" r="105" stroke="#ffffff" strokeOpacity="0.11" strokeWidth="1" strokeDasharray="3 3" />
                        <circle cx="710" cy="20" r="150" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1" />
                        <polygon
                          points="480,-10 560,75 660,35 590,-20"
                          stroke="#ffffff"
                          strokeOpacity="0.12"
                          strokeWidth="1"
                          fill="#ffffff"
                          fillOpacity="0.03"
                        />
                        <polygon
                          points="560,75 630,145 725,100 660,35"
                          stroke="#ffffff"
                          strokeOpacity="0.09"
                          strokeWidth="1"
                          fill="#ffffff"
                          fillOpacity="0.02"
                        />
                        <g fill="#ffffff" fillOpacity="0.25">
                          <circle cx="340" cy="30" r="1.5" />
                          <circle cx="360" cy="30" r="1.5" />
                          <circle cx="380" cy="30" r="1.5" />
                          <circle cx="350" cy="45" r="1.5" />
                          <circle cx="370" cy="45" r="1.5" />
                          <circle cx="390" cy="45" r="1.5" />
                        </g>
                        <line x1="0" y1="139" x2="760" y2="139" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1" />
                      </svg>

                      {/* Inner Header Row */}
                      <div className="relative z-10 flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3.5">
                          {tenantDisplayLogo ? (
                            <img
                              src={tenantDisplayLogo}
                              alt={tenantDisplayName}
                              className="w-12 h-12 object-contain rounded-xl p-1 bg-white border border-white/25 shrink-0 shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : null}
                          <div>
                            <div className="text-xl font-black text-white tracking-tight uppercase leading-tight drop-shadow-xs">
                              {tenantDisplayName}
                            </div>
                            <div className="text-[11px] text-blue-100 font-semibold mt-0.5">
                              {activeTenant?.domain || "Official Commercial & Operations Suite"}
                            </div>
                            <div className="text-[10px] text-blue-200/90 mt-0.5">
                              {activeTenant?.ownerEmail ? `Contact: ${activeTenant.ownerEmail}` : "Victoria Island / Ikeja Central Depot, Lagos, Nigeria"}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-md font-black text-[10px] uppercase tracking-wider shadow-xs">
                            {coverDocumentBadge || "OFFICIAL TRANSMITTAL"}
                          </span>
                          <div className="text-[10px] text-blue-100/90 font-mono font-medium mt-1.5">
                            Ref: {coverLetterLead ? (coverLetterLead.id.startsWith("LED-") ? coverLetterLead.id : "LD-" + coverLetterLead.id.slice(-6).toUpperCase()) : "PROP-REF"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* LETTER BODY CONTENT & FOOTER WRAPPER */}
                    <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-5">
                        {/* DATE ROW */}
                        <div className="text-right text-xs font-semibold text-slate-600">
                          Date: <span className="text-slate-900">{coverLetterDate}</span>
                        </div>

                        {/* RECIPIENT BLOCK: Attention (Contact Name) = Contact Name. Recipient Title/Designation = Recipient Title. Company/Organization = Company. */}
                        <div className="space-y-0.5 text-xs">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Delivered / Addressed To:
                          </div>
                          <div className="font-extrabold text-sm text-slate-900">
                            {coverRecipientName || "The Managing Director"}
                          </div>
                          {coverRecipientTitle && (
                            <div className="text-slate-700 font-medium">{coverRecipientTitle}</div>
                          )}
                          <div className="font-bold text-xs text-[#1A56DB]">
                            {coverRecipientCompany || "Client Organization"}
                          </div>
                          {coverRecipientAddress && (
                            <div className="text-slate-500 text-[11px]">{coverRecipientAddress}</div>
                          )}
                        </div>

                        {/* SUBJECT LINE */}
                        <div className="pt-1">
                          <div className="inline-block text-xs font-black text-slate-900 uppercase tracking-wide border-b-2 border-slate-900 pb-1">
                            RE: {coverLetterReference}
                          </div>
                        </div>

                        {/* SALUTATION */}
                        <div className="text-xs font-bold text-slate-800">
                          {coverLetterSalutation}
                        </div>

                        {/* LETTER BODY */}
                        <div className="text-xs text-slate-800 leading-relaxed space-y-3 whitespace-pre-line text-justify font-normal">
                          {coverLetterBody}
                        </div>

                        {/* CLOSING / SIGNATORY */}
                        <div className="pt-3 space-y-2.5">
                          <div className="text-xs font-semibold text-slate-700">
                            {coverLetterSignoff}
                          </div>
                          <div className="border-b border-slate-400 w-44 h-7"></div>
                          <div>
                            <div className="text-xs font-black text-slate-900">
                              {coverSignatoryName || tenantDisplayName}
                            </div>
                            {coverSignatoryTitle && (
                              <div className="text-[11px] font-medium text-slate-700">
                                {coverSignatoryTitle}
                              </div>
                            )}
                            {coverSignatoryDepartment && (
                              <div className="text-[10px] text-slate-500">
                                {coverSignatoryDepartment}
                              </div>
                            )}
                            {coverSignatoryContact && (
                              <div className="text-[10px] text-slate-500 font-mono">
                                {coverSignatoryContact}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* TENANT LETTERHEAD FOOTER */}
                      <div className="border-t border-slate-200 pt-3 mt-6 text-center text-[9px] text-slate-500 space-y-0.5">
                        <div>{coverTenantFooter}</div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                          Authorized Corporate Transmittal · Page 1 of 1
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-[var(--nexa-border)]">
              <div className="text-xs text-[var(--nexa-text-muted)] flex items-center gap-1.5">
                <BookmarkCheck className="w-4 h-4 text-emerald-500" />
                <span>
                  Official Letterhead: <strong className="text-[var(--nexa-text-primary)]">{tenantDisplayName}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <NexaButton
                  variant="secondary"
                  onClick={handleCopyCoverLetterText}
                  title="Copy full cover letter text to clipboard"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  {copiedCoverLetter ? "Copied!" : "Copy Text"}
                </NexaButton>
                <NexaButton
                  variant="secondary"
                  onClick={handleSaveCoverLetter}
                  disabled={isSavingCoverLetter || !coverLetterLead}
                  title="Save this cover letter to the database linked to this lead"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  {isSavingCoverLetter ? "Saving..." : "Save to Lead"}
                </NexaButton>
                <NexaButton
                  variant="primary"
                  onClick={handlePrintCoverLetter}
                  title="Print isolated cover letter or export to PDF"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  Print / Export PDF
                </NexaButton>
                <NexaButton variant="secondary" onClick={() => setIsCoverLetterModalOpen(false)}>
                  Close
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
          #lead-cover-letter-paper-area,
          #lead-cover-letter-paper-area * {
            visibility: visible !important;
          }
          #lead-cover-letter-paper-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #0f172a !important;
            z-index: 999999 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </ErpAdminShell>
  );
}
