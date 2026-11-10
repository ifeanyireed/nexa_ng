"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Mail,
  Copy,
  Check,
  Laptop,
  CreditCard,
  FileText,
  Key,
  ChevronRight,
  Sparkles,
  AlertCircle,
  X,
  Phone,
  Home,
  Award,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";
import {
  WorkforceOnboardingPacket,
  OnboardingStatus,
  WorkforceRoleCategory,
} from "@/lib/workforce-types";

export default function WorkforceOnboardingAdminPage() {
  const {
    onboardingPackets,
    candidates,
    initiateOnboarding,
    approveOnboardingDossier,
    provisionSystemUser,
  } = useWorkforceManager();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedPacket, setSelectedPacket] = useState<WorkforceOnboardingPacket | null>(null);

  // Manual Onboarding Initiation Modal
  const [isInitiateModalOpen, setIsInitiateModalOpen] = useState(false);
  const [initiateCandidateId, setInitiateCandidateId] = useState("");
  const [initiateDesignation, setInitiateDesignation] = useState("");
  const [initiateDepartment, setInitiateDepartment] = useState("Technology");
  const [initiateRoleCategory, setInitiateRoleCategory] = useState<WorkforceRoleCategory>("employee");

  // Provisioning Modal
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [provisionPacket, setProvisionPacket] = useState<WorkforceOnboardingPacket | null>(null);
  const [corporateEmail, setCorporateEmail] = useState("");
  const [accessRole, setAccessRole] = useState("Staff Specialist");
  const [assignedAssetTag, setAssignedAssetTag] = useState("");
  const [assignedSerial, setAssignedSerial] = useState("");

  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCopyLink = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/careers/onboard/${token}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const filteredPackets = onboardingPackets.filter((p) => {
    const matchesSearch =
      p.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenProvisionModal = (packet: WorkforceOnboardingPacket) => {
    setProvisionPacket(packet);
    const slugEmail = `${packet.candidateName.toLowerCase().replace(/\s+/g, ".")}@ofia.ng`;
    setCorporateEmail(packet.systemAccount?.corporateEmail || slugEmail);
    setAccessRole(packet.designation);
    setAssignedAssetTag(packet.equipmentRequisition?.assetTag || `OFIA-AST-2027-${Math.floor(100 + Math.random() * 900)}`);
    setAssignedSerial(packet.equipmentRequisition?.serialNumber || `SN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
    setIsProvisionModalOpen(true);
  };

  const handleExecuteProvision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provisionPacket) return;

    provisionSystemUser(provisionPacket.id, {
      candidateName: provisionPacket.candidateName,
      candidateId: provisionPacket.candidateId,
      corporateEmail,
      designation: provisionPacket.designation,
      department: provisionPacket.department,
      roleCategory: provisionPacket.roleCategory,
      accessRole,
      residentialAddress: provisionPacket.residentialAddress,
      phone: provisionPacket.nextOfKin?.phone || "+234 800 000 0000",
      location: "Lagos HQ",
    });

    setIsProvisionModalOpen(false);
    setProvisionPacket(null);
  };

  const handleManualInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    const cand = candidates.find((c) => c.id === initiateCandidateId);
    if (!cand) return;

    initiateOnboarding({
      candidateId: cand.id,
      candidateName: cand.name,
      candidateEmail: cand.email,
      designation: initiateDesignation || cand.appliedRole,
      department: initiateDepartment || cand.department,
      roleCategory: initiateRoleCategory,
    });

    setIsInitiateModalOpen(false);
  };

  return (
    <ErpAdminShell
      title="Staff Onboarding & Identity Provisioning"
      subtitle="Module 01b · Statutory intake, Nigerian banking NUBAN validation, equipment logistics, and corporate user activation."
      activeModule="workforce"
      action={
        <div className="flex items-center gap-2">
          <NexaButton
            size="sm"
            variant="primary"
            className="gap-2 text-xs"
            onClick={() => setIsInitiateModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Initiate Onboarding
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-8">
        {/* KPI COUNTERS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Total In Process</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{onboardingPackets.length} Candidates</p>
            <p className="text-xs text-nexa-text-secondary mt-1">Across all cohorts</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Awaiting HR Review</span>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {onboardingPackets.filter((p) => p.status === "in_review").length} Dossiers
            </p>
            <p className="text-xs text-amber-500 mt-1 font-medium">Bank & NIN validation ready</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Approved for Provisioning</span>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {onboardingPackets.filter((p) => p.status === "approved").length} Packets
            </p>
            <p className="text-xs text-blue-500 mt-1 font-medium">Ready for @ofia.ng account issuance</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Provisioned & Active</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {onboardingPackets.filter((p) => p.status === "provisioned").length} Activated
            </p>
            <p className="text-xs text-emerald-500 mt-1 font-medium">Synced with personnel directory</p>
          </div>
        </section>

        {/* ONBOARDING PACKETS REGISTRY */}
        <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-500" />
                Staff Onboarding Packets
              </h2>
              <p className="text-xs text-nexa-text-secondary">
                Verify statutory documents, banking records, equipment preferences, and provision corporate system credentials.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-nexa-text-secondary" />
                <input
                  type="text"
                  placeholder="Search name, email, department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="pending_intake">Pending Intake</option>
                <option value="in_review">In Review</option>
                <option value="approved">Approved</option>
                <option value="provisioned">Provisioned</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-nexa-surface/60 text-nexa-text-secondary uppercase text-[10px] tracking-wider border-b border-nexa-border">
                <tr>
                  <th className="py-3 px-4">New Hire & Role</th>
                  <th className="py-3 px-4">Department & Type</th>
                  <th className="py-3 px-4">Statutory & Bank</th>
                  <th className="py-3 px-4">Equipment Choice</th>
                  <th className="py-3 px-4">Packet Status</th>
                  <th className="py-3 px-4 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nexa-border/60">
                {filteredPackets.map((pkt) => (
                  <tr
                    key={pkt.id}
                    className="hover:bg-nexa-surface/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedPacket(pkt)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-nexa-text-primary">{pkt.candidateName}</div>
                      <div className="text-[11px] text-blue-400 font-medium">{pkt.designation}</div>
                      <div className="text-[10px] text-nexa-text-secondary">{pkt.candidateEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-nexa-text-primary">
                      <div>{pkt.department}</div>
                      <span className="capitalize text-[10px] text-nexa-text-secondary bg-nexa-surface px-1.5 py-0.5 rounded border border-nexa-border">
                        {pkt.roleCategory}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {pkt.bankDetails ? (
                        <div>
                          <div className="font-bold text-nexa-text-primary">{pkt.bankDetails.bankName}</div>
                          <div className="text-[10px] text-nexa-text-secondary font-mono">
                            {pkt.bankDetails.accountNumber} ({pkt.bankDetails.accountName})
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-500 font-medium">Awaiting Submission</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-nexa-text-primary">
                      {pkt.equipmentRequisition?.laptopPreference ? (
                        <div className="flex items-center gap-1.5">
                          <Laptop className="w-3.5 h-3.5 text-blue-400" />
                          <span>{pkt.equipmentRequisition.laptopPreference}</span>
                        </div>
                      ) : (
                        <span className="text-nexa-text-secondary">Standard Laptop</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {pkt.status === "provisioned" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Provisioned & Active
                        </span>
                      ) : pkt.status === "approved" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Approved / Awaiting Account
                        </span>
                      ) : pkt.status === "in_review" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          In Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          Pending Intake
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {pkt.status === "in_review" && (
                          <NexaButton
                            size="sm"
                            variant="secondary"
                            className="text-xs py-1 px-2 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30"
                            onClick={() => approveOnboardingDossier(pkt.id)}
                          >
                            Approve
                          </NexaButton>
                        )}

                        {pkt.status === "approved" && (
                          <NexaButton
                            size="sm"
                            variant="primary"
                            className="text-xs py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 gap-1"
                            onClick={() => handleOpenProvisionModal(pkt)}
                          >
                            <Key className="w-3 h-3" />
                            Provision Account
                          </NexaButton>
                        )}

                        <Link
                          href={`/careers/onboard/${pkt.token}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-secondary hover:text-nexa-text-primary transition-colors"
                          title="Candidate Intake Portal"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleCopyLink(pkt.token)}
                          className="p-1.5 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-secondary hover:text-nexa-text-primary transition-colors"
                          title="Copy Portal Link"
                        >
                          {copiedToken === pkt.token ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* MODAL: FULL DOSSIER REVIEW */}
        {selectedPacket && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <div>
                  <h3 className="text-base font-bold text-nexa-text-primary">{selectedPacket.candidateName}</h3>
                  <p className="text-xs text-nexa-text-secondary">
                    {selectedPacket.designation} · {selectedPacket.department}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPacket(null)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* STATUTORY SECTION */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Statutory & Identity Verification
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs bg-nexa-surface/60 p-4 rounded-xl border border-nexa-border">
                  <div>
                    <span className="text-nexa-text-secondary block">NIN (National Identity):</span>
                    <span className="font-mono font-semibold text-nexa-text-primary">
                      {selectedPacket.nin || "Not submitted"}
                    </span>
                  </div>
                  <div>
                    <span className="text-nexa-text-secondary block">BVN (Bank Verification):</span>
                    <span className="font-mono font-semibold text-nexa-text-primary">
                      {selectedPacket.bvn || "Not submitted"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-nexa-text-secondary block">Residential Address:</span>
                    <span className="font-semibold text-nexa-text-primary">
                      {selectedPacket.residentialAddress || "Not submitted"}
                    </span>
                  </div>
                </div>
              </div>

              {/* BANKING SECTION */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> Remuneration & Pension Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs bg-nexa-surface/60 p-4 rounded-xl border border-nexa-border">
                  <div>
                    <span className="text-nexa-text-secondary block">Bank Name:</span>
                    <span className="font-semibold text-nexa-text-primary">
                      {selectedPacket.bankDetails?.bankName || "Unassigned"}
                    </span>
                  </div>
                  <div>
                    <span className="text-nexa-text-secondary block">NUBAN Account:</span>
                    <span className="font-mono font-semibold text-nexa-text-primary">
                      {selectedPacket.bankDetails?.accountNumber || "Unassigned"}
                    </span>
                  </div>
                  <div>
                    <span className="text-nexa-text-secondary block">PFA Administrator:</span>
                    <span className="font-semibold text-nexa-text-primary">
                      {selectedPacket.bankDetails?.pfaName || "Unassigned"}
                    </span>
                  </div>
                  <div>
                    <span className="text-nexa-text-secondary block">RSA PIN:</span>
                    <span className="font-mono font-semibold text-nexa-text-primary">
                      {selectedPacket.bankDetails?.rsaPin || "Unassigned"}
                    </span>
                  </div>
                </div>
              </div>

              {/* NEXT OF KIN SECTION */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Home className="w-4 h-4" /> Next of Kin
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs bg-nexa-surface/60 p-4 rounded-xl border border-nexa-border">
                  <div>
                    <span className="text-nexa-text-secondary block">Full Name:</span>
                    <span className="font-semibold text-nexa-text-primary">
                      {selectedPacket.nextOfKin?.name || "Unassigned"}
                    </span>
                  </div>
                  <div>
                    <span className="text-nexa-text-secondary block">Relationship:</span>
                    <span className="font-semibold text-nexa-text-primary">
                      {selectedPacket.nextOfKin?.relationship || "Unassigned"}
                    </span>
                  </div>
                  <div>
                    <span className="text-nexa-text-secondary block">Phone:</span>
                    <span className="font-semibold text-nexa-text-primary">
                      {selectedPacket.nextOfKin?.phone || "Unassigned"}
                    </span>
                  </div>
                  <div>
                    <span className="text-nexa-text-secondary block">Address:</span>
                    <span className="font-semibold text-nexa-text-primary">
                      {selectedPacket.nextOfKin?.address || "Same as residence"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-3 border-t border-nexa-border flex items-center justify-between">
                <div className="text-xs text-nexa-text-secondary">
                  Current Status: <strong className="text-nexa-text-primary uppercase">{selectedPacket.status}</strong>
                </div>

                <div className="flex items-center gap-2">
                  {selectedPacket.status === "in_review" && (
                    <NexaButton
                      size="sm"
                      variant="primary"
                      className="text-xs py-1 px-3 bg-blue-600 hover:bg-blue-500"
                      onClick={() => {
                        approveOnboardingDossier(selectedPacket.id);
                        setSelectedPacket((prev) => (prev ? { ...prev, status: "approved" } : null));
                      }}
                    >
                      Approve Dossier
                    </NexaButton>
                  )}

                  {selectedPacket.status === "approved" && (
                    <NexaButton
                      size="sm"
                      variant="primary"
                      className="text-xs py-1 px-3 bg-emerald-600 hover:bg-emerald-500 gap-1.5"
                      onClick={() => {
                        handleOpenProvisionModal(selectedPacket);
                        setSelectedPacket(null);
                      }}
                    >
                      <Key className="w-3.5 h-3.5" />
                      Provision Account
                    </NexaButton>
                  )}

                  <NexaButton
                    size="sm"
                    variant="secondary"
                    className="text-xs py-1 px-3"
                    onClick={() => setSelectedPacket(null)}
                  >
                    Close
                  </NexaButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: PROVISION SYSTEM ACCOUNT */}
        {isProvisionModalOpen && provisionPacket && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-500" />
                  Provision Corporate Account & Active Staff Profile
                </h3>
                <button
                  onClick={() => setIsProvisionModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleExecuteProvision} className="space-y-4 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Corporate Email Address (@ofia.ng)</label>
                  <input
                    type="email"
                    required
                    value={corporateEmail}
                    onChange={(e) => setCorporateEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Assigned Access Role</label>
                    <input
                      type="text"
                      required
                      value={accessRole}
                      onChange={(e) => setAccessRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Designated Department</label>
                    <input
                      type="text"
                      readOnly
                      value={provisionPacket.department}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface/60 border border-nexa-border text-nexa-text-secondary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Assigned Asset Tag</label>
                    <input
                      type="text"
                      value={assignedAssetTag}
                      onChange={(e) => setAssignedAssetTag(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Hardware Serial Number</label>
                    <input
                      type="text"
                      value={assignedSerial}
                      onChange={(e) => setAssignedSerial(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1 text-emerald-300">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Automated State Transitions:
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                    <li>Activates new personnel record in <strong>workforce_people</strong>.</li>
                    <li>Advances candidate pipeline stage to <strong>onboarded</strong>.</li>
                    <li>Dispatches initial ERP access and LMS academy credentials.</li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    size="sm"
                    variant="secondary"
                    type="button"
                    onClick={() => setIsProvisionModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton
                    size="sm"
                    variant="primary"
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5" />
                    Activate Staff Profile
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: INITIATE MANUAL ONBOARDING */}
        {isInitiateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  Initiate Candidate Onboarding
                </h3>
                <button
                  onClick={() => setIsInitiateModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleManualInitiate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Select Candidate</label>
                  <select
                    value={initiateCandidateId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setInitiateCandidateId(id);
                      const c = candidates.find((item) => item.id === id);
                      if (c) {
                        setInitiateDesignation(c.appliedRole);
                        setInitiateDepartment(c.department || "Technology");
                        setInitiateRoleCategory(c.appliedRole.toLowerCase().includes("intern") ? "intern" : "employee");
                      }
                    }}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  >
                    <option value="">-- Choose Candidate --</option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.appliedRole} ({c.stage})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Designation</label>
                    <input
                      type="text"
                      required
                      value={initiateDesignation}
                      onChange={(e) => setInitiateDesignation(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={initiateDepartment}
                      onChange={(e) => setInitiateDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Staff Category</label>
                  <select
                    value={initiateRoleCategory}
                    onChange={(e) => setInitiateRoleCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  >
                    <option value="employee">Full-Time Employee</option>
                    <option value="intern">Academy Intern</option>
                    <option value="contractor">Technical Contractor</option>
                    <option value="consultant">Practice Consultant</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    size="sm"
                    variant="secondary"
                    type="button"
                    onClick={() => setIsInitiateModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton size="sm" variant="primary" type="submit">
                    Generate Onboarding Token
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ErpAdminShell>
  );
}
