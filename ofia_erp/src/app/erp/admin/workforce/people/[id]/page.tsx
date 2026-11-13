"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Building2,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Award,
  Clock,
  Briefcase,
  CheckCircle2,
  FileText,
  Upload,
  ShieldCheck,
  Network,
  Layers,
  Edit2,
  Plus,
  Trash2,
  AlertCircle,
  ExternalLink,
  GraduationCap,
  CheckSquare,
  TrendingUp,
  FileCheck,
  History,
  X,
  UserCheck,
  DollarSign,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";
import { WorkforceDocument } from "@/lib/workforce-types";

type DossierTab =
  | "overview"
  | "personal"
  | "employment"
  | "education"
  | "skills"
  | "training"
  | "projects"
  | "tasks"
  | "attendance"
  | "performance"
  | "promotions"
  | "documents"
  | "deployment"
  | "activity";

export default function IndividualPersonDossierPage() {
  const params = useParams();
  const router = useRouter();
  const personId = String(params.id || "");

  const {
    people,
    tasks,
    attendance,
    courses,
    assignments,
    promotions,
    deployments,
    documents,
    auditLogs,
    departments,
    updatePersonProfile,
    uploadDocument,
    verifyDocument,
    deleteDocument,
  } = useWorkforceManager();

  const [activeTab, setActiveTab] = useState<DossierTab>("overview");

  // Document Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState<"cv" | "contract" | "nda" | "certificate" | "id_card" | "other">("cv");
  const [docUrl, setDocUrl] = useState("");

  // Edit Personal Info Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editKinName, setEditKinName] = useState("");
  const [editKinRel, setEditKinRel] = useState("");
  const [editKinPhone, setEditKinPhone] = useState("");

  // Find person
  const person = people.find((p) => p.id === personId);

  // Associated datasets
  const personTasks = tasks.filter((t) => t.assignedTo.toLowerCase() === person?.name.toLowerCase());
  const personAttendance = attendance.filter((a) => a.personName.toLowerCase() === person?.name.toLowerCase());
  const personPromotions = promotions.filter((pr) => pr.personName.toLowerCase() === person?.name.toLowerCase());
  const personDeployments = deployments.filter(
    (d) => d.personId === person?.id || d.personName.toLowerCase() === person?.name.toLowerCase()
  );
  const personDocuments = documents.filter((doc) => doc.personId === person?.id);
  const personAuditLogs = auditLogs.filter(
    (log) => log.entityId === person?.id || log.actorName.toLowerCase() === person?.name.toLowerCase()
  );

  if (!person) {
    return (
      <ErpAdminShell>
        <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-nexa-text-primary">Personnel Record Not Found</h2>
          <p className="text-sm text-nexa-text-secondary">
            The requested individual profile ID ({personId}) does not exist in the tenant database.
          </p>
          <Link href="/erp/admin/workforce/people">
            <NexaButton variant="outline" size="sm" className="mt-2 text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Return to People Directory
            </NexaButton>
          </Link>
        </div>
      </ErpAdminShell>
    );
  }

  const openEditModal = () => {
    setEditName(person.name);
    setEditPhone(person.phone);
    setEditEmail(person.email);
    setEditDesignation(person.designation);
    setEditDepartment(person.department);
    setEditLocation(person.location);
    setEditAddress(person.residentialAddress || "Plot 14, Admiralty Way, Lekki Phase 1, Lagos");
    setEditKinName(person.emergencyContact?.name || "Mrs. Folashade " + person.name.split(" ")[1]);
    setEditKinRel(person.emergencyContact?.relationship || "Spouse");
    setEditKinPhone(person.emergencyContact?.phone || "+234 803 999 8877");
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updatePersonProfile(person.id, {
      name: editName,
      phone: editPhone,
      email: editEmail,
      designation: editDesignation,
      department: editDepartment,
      location: editLocation,
      residentialAddress: editAddress,
      emergencyContact: {
        name: editKinName,
        relationship: editKinRel,
        phone: editKinPhone,
      },
    });
    setIsEditProfileOpen(false);
  };

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;

    const newDoc: WorkforceDocument = {
      id: `doc-${Date.now()}`,
      personId: person.id,
      documentType: docType,
      title: docTitle,
      fileUrl: docUrl || `https://documents.ofia.ng/vault/${person.id}/${encodeURIComponent(docTitle)}`,
      fileSizeBytes: Math.floor(800000 + Math.random() * 2000000),
      uploadedBy: "HR Compliance Officer",
      verified: true,
      createdAt: new Date().toLocaleString(),
    };

    uploadDocument(newDoc);
    setDocTitle("");
    setDocUrl("");
    setIsUploadModalOpen(false);
  };

  const tabList: { key: DossierTab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "personal", label: "Personal Information" },
    { key: "employment", label: "Employment History" },
    { key: "education", label: "Education & Degrees" },
    { key: "skills", label: "Skills Matrix", count: person.skills.length },
    { key: "training", label: "Academy & Certs", count: courses.length },
    { key: "projects", label: "Assigned Projects" },
    { key: "tasks", label: "Tasks & Deliverables", count: personTasks.length },
    { key: "attendance", label: "Attendance Log", count: personAttendance.length },
    { key: "performance", label: "Performance Scorecard" },
    { key: "promotions", label: "Promotions History", count: personPromotions.length },
    { key: "documents", label: "Documents Vault", count: personDocuments.length },
    { key: "deployment", label: "Deployments", count: personDeployments.length },
    { key: "activity", label: "Audit Trail", count: personAuditLogs.length },
  ];

  return (
    <ErpAdminShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/erp/admin/workforce/people"
            className="text-xs text-nexa-text-secondary hover:text-nexa-text-primary flex items-center gap-1.5 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to People Directory
          </Link>

          <div className="flex items-center gap-2">
            <NexaButton
              variant="outline"
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
              className="text-xs border-nexa-border text-nexa-text-primary"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
              Upload Document
            </NexaButton>

            <NexaButton
              variant="primary"
              size="sm"
              onClick={openEditModal}
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Edit Personnel Profile
            </NexaButton>
          </div>
        </div>

        {/* HERO CARD: 14-POINT CENTRAL PERSON RECORD */}
        <div className="rounded-2xl bg-nexa-surface border border-nexa-border p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 flex items-center justify-center font-bold text-xl text-blue-600 dark:text-blue-400 shrink-0">
                {person.avatar ? (
                  <img src={person.avatar} alt={person.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  person.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-nexa-text-primary">{person.name}</h1>
                  <NexaBadge
                    variant={person.status === "deployed" ? "primary" : "secondary"}
                    className="capitalize text-xs py-0.5"
                  >
                    {person.status}
                  </NexaBadge>
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-nexa-base border border-nexa-border text-nexa-text-secondary font-semibold">
                    {person.role}
                  </span>
                  {person.cohort && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
                      {person.cohort}
                    </span>
                  )}
                </div>

                <p className="text-sm text-nexa-text-secondary font-medium">{person.designation}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-nexa-text-muted pt-1">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-nexa-text-muted" />
                    <span className="text-nexa-text-secondary">{person.department}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-nexa-text-muted" />
                    <span className="text-nexa-text-secondary">{person.location}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-nexa-text-muted" />
                    <span className="text-nexa-text-secondary">Joined {person.joinDate}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-nexa-text-muted" />
                    <span className="text-nexa-text-secondary">Reports to: {person.managerName}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Cluster */}
            <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-nexa-border pt-4 md:pt-0 md:pl-6">
              <div className="text-center px-3">
                <p className="text-[10px] uppercase tracking-wider text-nexa-text-muted">Competency</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{person.competencyScore}%</p>
                <p className="text-[10px] text-nexa-text-muted">Verified</p>
              </div>

              <div className="text-center px-3 border-x border-nexa-border">
                <p className="text-[10px] uppercase tracking-wider text-nexa-text-muted">Active Tasks</p>
                <p className="text-xl font-bold text-nexa-text-primary mt-0.5">{personTasks.length}</p>
                <p className="text-[10px] text-blue-500">Assigned</p>
              </div>

              <div className="text-center px-3">
                <p className="text-[10px] uppercase tracking-wider text-nexa-text-muted">Attendance</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{person.attendanceRate}%</p>
                <p className="text-[10px] text-nexa-text-muted">90-Day Rate</p>
              </div>
            </div>
          </div>

          {person.currentClient && (
            <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between text-xs text-cyan-800 dark:text-cyan-200">
              <span className="flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-500" />
                Active Client Deployment: <strong className="text-cyan-900 dark:text-cyan-100">{person.currentClient}</strong>
              </span>
              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono">100% Dedicated Allocation</span>
            </div>
          )}
        </div>

        {/* 14-TAB HORIZONTAL SCROLLABLE BAR */}
        <div className="border-b border-nexa-border overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 min-w-max pb-2">
            {tabList.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold"
                    : "text-nexa-text-secondary hover:text-nexa-text-primary hover:bg-nexa-surface border border-transparent"
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      activeTab === tab.key ? "bg-blue-500/20 text-blue-600 dark:text-blue-300" : "bg-nexa-base text-nexa-text-muted border border-nexa-border"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="rounded-xl bg-nexa-surface border border-nexa-border p-5 shadow-xs space-y-4">
                <h3 className="font-semibold text-nexa-text-primary text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  Executive Personnel Summary
                </h3>
                <p className="text-xs text-nexa-text-secondary leading-relaxed">
                  {person.name} is currently designated as a <strong>{person.designation}</strong> in the{" "}
                  <strong>{person.department}</strong> department, reporting directly to {person.managerName}.
                  Operating status is <strong>{person.status}</strong> with an aggregate competency evaluation score of{" "}
                  <strong>{person.competencyScore}%</strong> and a historical attendance compliance rate of{" "}
                  <strong>{person.attendanceRate}%</strong>.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-lg bg-nexa-base border border-nexa-border">
                    <span className="text-nexa-text-muted block text-[11px]">Primary Contact</span>
                    <span className="font-medium text-nexa-text-primary mt-1 block">{person.email}</span>
                    <span className="text-nexa-text-secondary block text-[11px] mt-0.5">{person.phone}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-nexa-base border border-nexa-border">
                    <span className="text-nexa-text-muted block text-[11px]">Facility Base</span>
                    <span className="font-medium text-nexa-text-primary mt-1 block">{person.location}</span>
                    <span className="text-blue-600 dark:text-blue-400 block text-[11px] mt-0.5 font-medium">Verified Geofenced Facility</span>
                  </div>
                </div>
              </div>

              {/* Active Tasks Widget */}
              <div className="rounded-xl bg-nexa-surface border border-nexa-border p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-nexa-text-primary text-sm flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-500" />
                    Active Tasks & Deliverables ({personTasks.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab("tasks")}
                    className="text-[11px] text-blue-500 hover:underline font-medium"
                  >
                    View All &rarr;
                  </button>
                </div>

                <div className="space-y-2.5">
                  {personTasks.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-lg bg-nexa-base border border-nexa-border flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-medium text-nexa-text-primary">{t.title}</p>
                        <p className="text-[11px] text-nexa-text-muted mt-0.5">
                          Project: {t.project} · Deadline: {t.deadline}
                        </p>
                      </div>
                      <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold">
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Skills & Vault Snapshot */}
            <div className="space-y-6">
              <div className="rounded-xl bg-nexa-surface border border-nexa-border p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-nexa-text-primary text-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    Verified Skills
                  </h3>
                  <button
                    onClick={() => setActiveTab("skills")}
                    className="text-[11px] text-amber-500 hover:underline font-medium"
                  >
                    Matrix &rarr;
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {person.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs bg-nexa-base border border-nexa-border text-nexa-text-secondary flex items-center gap-1.5"
                    >
                      {s.name}
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">({s.level})</span>
                      {s.verified && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-nexa-surface border border-nexa-border p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-nexa-text-primary text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    Personnel Documents ({personDocuments.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab("documents")}
                    className="text-[11px] text-purple-500 hover:underline font-medium"
                  >
                    Vault &rarr;
                  </button>
                </div>

                <div className="space-y-2">
                  {personDocuments.slice(0, 3).map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 rounded-lg bg-nexa-base border border-nexa-border flex items-center justify-between text-xs"
                    >
                      <span className="truncate text-nexa-text-primary max-w-[180px]">{doc.title}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PERSONAL INFORMATION */}
        {activeTab === "personal" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-nexa-surface border border-nexa-border p-6 shadow-xs space-y-4">
              <h3 className="font-semibold text-nexa-text-primary text-sm flex items-center gap-2 border-b border-nexa-border pb-3">
                <User className="w-4 h-4 text-blue-500" />
                Contact & Identity Details
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-nexa-border">
                  <span className="text-nexa-text-muted">Full Legal Name</span>
                  <span className="font-medium text-nexa-text-primary">{person.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-nexa-border">
                  <span className="text-nexa-text-muted">Official Work Email</span>
                  <span className="font-mono text-nexa-text-secondary">{person.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-nexa-border">
                  <span className="text-nexa-text-muted">Mobile Phone</span>
                  <span className="font-mono text-nexa-text-secondary">{person.phone}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-nexa-border">
                  <span className="text-nexa-text-muted">Primary Office Location</span>
                  <span className="text-nexa-text-secondary">{person.location}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-nexa-text-muted">Residential Address</span>
                  <span className="text-nexa-text-secondary text-right max-w-xs">
                    {person.residentialAddress || "Plot 14, Admiralty Way, Lekki Phase 1, Lagos State"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-nexa-surface border border-nexa-border p-6 shadow-xs space-y-4">
              <h3 className="font-semibold text-nexa-text-primary text-sm flex items-center gap-2 border-b border-nexa-border pb-3">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Emergency Contact & Next-of-Kin
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-nexa-border">
                  <span className="text-nexa-text-muted">Contact Name</span>
                  <span className="font-medium text-nexa-text-primary">
                    {person.emergencyContact?.name || "Mrs. Folashade " + person.name.split(" ")[1]}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-nexa-border">
                  <span className="text-nexa-text-muted">Relationship</span>
                  <span className="text-nexa-text-secondary">{person.emergencyContact?.relationship || "Spouse / Next-of-Kin"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-nexa-border">
                  <span className="text-nexa-text-muted">Emergency Phone</span>
                  <span className="font-mono text-nexa-text-secondary">
                    {person.emergencyContact?.phone || "+234 803 999 8877"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-nexa-text-muted">Verification Status</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Identity Confirmed
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EMPLOYMENT HISTORY */}
        {activeTab === "employment" && (
          <div className="rounded-xl bg-nexa-surface border border-nexa-border p-6 shadow-xs space-y-6">
            <h3 className="font-semibold text-nexa-text-primary text-sm flex items-center gap-2 border-b border-nexa-border pb-3">
              <Briefcase className="w-4 h-4 text-blue-500" />
              Organizational Employment Timeline
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-nexa-base border border-nexa-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-nexa-text-primary text-sm">{person.designation}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono uppercase font-bold text-[10px]">
                    Current Engagement
                  </span>
                </div>
                <p className="text-nexa-text-secondary">
                  Ofia Enterprise Suite · {person.department} Department · Base: {person.location}
                </p>
                <p className="text-nexa-text-muted text-[11px]">
                  Effective from {person.joinDate} to Present · Reporting to {person.managerName}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-nexa-base border border-nexa-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-nexa-text-primary">Associate Technical Fellow (Probation)</span>
                  <span className="text-nexa-text-muted font-mono text-[11px]">2024 - 2025</span>
                </div>
                <p className="text-nexa-text-secondary">Graduate Talent Incubator · Completed with Distinction</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EDUCATION & DEGREES */}
        {activeTab === "education" && (
          <div className="rounded-xl bg-nexa-surface border border-nexa-border p-6 shadow-xs space-y-6">
            <h3 className="font-semibold text-nexa-text-primary text-sm flex items-center gap-2 border-b border-nexa-border pb-3">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              Higher Education & Qualifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-nexa-base border border-nexa-border space-y-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                  B.Sc. Degree (First Class Honours)
                </span>
                <h4 className="font-bold text-nexa-text-primary text-sm mt-1">University of Lagos (UNILAG)</h4>
                <p className="text-nexa-text-secondary">Computer Science & Systems Engineering</p>
                <p className="text-nexa-text-muted text-[11px]">Graduated Class of 2024 · Verified Transcript on File</p>
              </div>

              <div className="p-4 rounded-xl bg-nexa-base border border-nexa-border space-y-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                  Professional Diploma
                </span>
                <h4 className="font-bold text-nexa-text-primary text-sm mt-1">National Information Technology Academy</h4>
                <p className="text-nexa-text-secondary">Cloud Architecture & Distributed Microservices</p>
                <p className="text-nexa-text-muted text-[11px]">Conferred 2025 · Verified Certificate</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SKILLS MATRIX */}
        {activeTab === "skills" && (
          <div className="rounded-xl bg-nexa-surface border border-nexa-border p-6 shadow-xs space-y-6">
            <h3 className="font-semibold text-nexa-text-primary text-sm flex items-center gap-2 border-b border-nexa-border pb-3">
              <Award className="w-4 h-4 text-amber-500" />
              Verified Competencies & Proficiency Levels
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {person.skills.map((s, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-nexa-base border border-nexa-border flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-nexa-text-primary text-sm flex items-center gap-2">
                      {s.name}
                      {s.verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    </p>
                    <p className="text-[11px] text-nexa-text-muted">Assessed by Technical Supervisor</p>
                  </div>
                  <span
                    className={`font-mono text-xs px-2.5 py-1 rounded-md font-bold uppercase ${
                      s.level === "Expert"
                        ? "bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30"
                        : s.level === "Advanced"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                        : "bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {s.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: TRAINING & CERTIFICATIONS */}
        {activeTab === "training" && (
          <div className="rounded-xl bg-nexa-surface border border-nexa-border p-6 shadow-xs space-y-6">
            <h3 className="font-semibold text-nexa-text-primary text-sm flex items-center gap-2 border-b border-nexa-border pb-3">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              Talent Academy Courses & Examination Certifications
            </h3>

            <div className="space-y-3 text-xs">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-nexa-base border border-nexa-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
                        {c.code}
                      </span>
                      <h4 className="font-semibold text-nexa-text-primary text-sm">{c.title}</h4>
                    </div>
                    <p className="text-nexa-text-secondary mt-1">
                      Track: {c.track} · Instructor: {c.instructor} · Duration: {c.durationWeeks} weeks
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
                      Status: Certified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: ASSIGNED PROJECTS */}
        {activeTab === "projects" && (
          <div className="rounded-xl bg-nexa-surface border border-nexa-border p-6 shadow-xs space-y-6">
            <h3 className="font-semibold text-nexa-text-primary text-sm flex items-center gap-2 border-b border-nexa-border pb-3">
              <Layers className="w-4 h-4 text-blue-500" />
              Active & Historical Project Allocations
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-nexa-base border border-nexa-border space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-nexa-text-primary text-sm">Core ERP Platform Engineering</h4>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                    Active
                  </span>
                </div>
                <p className="text-nexa-text-secondary">
                  Lead development on multi-tenant DEDICATED database resolver and Redis caching layers.
                </p>
              </div>

              {person.currentClient && (
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-cyan-900 dark:text-cyan-200 text-sm">{person.currentClient} Technical SLA Contract</h4>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold">
                      Deployed
                    </span>
                  </div>
                  <p className="text-nexa-text-secondary">Dedicated operational systems engineering and dispatch telemetry.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: TASKS & DELIVERABLES */}
        {activeTab === "tasks" && (
          <div className="rounded-xl bg-nexa-surface border border-nexa-border p-6 shadow-xs space-y-6">
            <h3 className="font-semibold text-nexa-text-primary text-sm flex items-center gap-2 border-b border-nexa-border pb-3">
              <CheckSquare className="w-4 h-4 text-blue-500" />
              Assigned Operational Tasks ({personTasks.length})
            </h3>

            {personTasks.length === 0 ? (
              <p className="text-xs text-nexa-text-muted py-6 text-center">No tasks assigned to {person.name} yet.</p>
            ) : (
              <div className="space-y-3 text-xs">
                {personTasks.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-nexa-base border border-nexa-border space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-nexa-text-primary text-sm">{t.title}</h4>
                      <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
                        {t.status}
                      </span>
                    </div>
                    <p className="text-nexa-text-secondary">Project: {t.project} · Priority: {t.priority} · Deadline: {t.deadline}</p>
                    {t.deliverableSummary && (
                      <div className="p-2.5 rounded bg-nexa-surface border border-nexa-border text-[11px] text-nexa-text-secondary">
                        <strong className="text-nexa-text-muted">Deliverable:</strong> {t.deliverableSummary}
                      </div>
                    )}
                    {t.feedback && (
                      <p className="text-[11px] text-blue-600 dark:text-blue-400">
                        <strong>Supervisor Feedback ({t.score}/100):</strong> {t.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 9: ATTENDANCE LOG */}
        {activeTab === "attendance" && (
          <div className="rounded-xl bg-nexa-surface border border-nexa-border p-6 shadow-xs space-y-6">
            <h3 className="font-semibold text-nexa-text-primary text-sm flex items-center gap-2 border-b border-nexa-border pb-3">
              <Clock className="w-4 h-4 text-blue-500" />
              Timesheet & Clock-In/Out Audit Log
            </h3>

            {personAttendance.length === 0 ? (
              <p className="text-xs text-nexa-text-muted py-6 text-center">No recent clock-in records found for this person.</p>
            ) : (
              <div className="space-y-2 text-xs">
                {personAttendance.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-lg bg-nexa-base border border-nexa-border flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-nexa-text-primary">{att.date}</span>
                      <p className="text-[11px] text-nexa-text-muted mt-0.5">
                        In: {att.clockIn} · Out: {att.clockOut || "Active Session"} · Location: {att.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {att.verifiedGps && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                          GPS Verified
                        </span>
                      )}
                      <span className="font-mono uppercase text-[10px] px-2 py-0.5 rounded bg-nexa-surface text-nexa-text-secondary border border-nexa-border font-bold">
                        {att.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 10: PERFORMANCE SCORECARD */}
        {activeTab === "performance" && (
          <div className="rounded-xl bg-nexa-surface border border-nexa-border p-6 shadow-xs space-y-6">
            <h3 className="font-semibold text-nexa-text-primary text-sm flex items-center gap-2 border-b border-nexa-border pb-3">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Performance Scorecard & Appraisal History
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-nexa-base border border-nexa-border text-center space-y-1">
                <span className="text-nexa-text-muted uppercase text-[10px] font-semibold">Overall Rating</span>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{person.competencyScore}%</p>
                <p className="text-[10px] text-nexa-text-muted">Exceeds Expectations</p>
              </div>

              <div className="p-4 rounded-xl bg-nexa-base border border-nexa-border text-center space-y-1">
                <span className="text-nexa-text-muted uppercase text-[10px] font-semibold">Deliverable Quality</span>
                <p className="text-3xl font-bold text-blue-500">96%</p>
                <p className="text-[10px] text-nexa-text-muted">First-Time Approval</p>
              </div>

              <div className="p-4 rounded-xl bg-nexa-base border border-nexa-border text-center space-y-1">
                <span className="text-nexa-text-muted uppercase text-[10px] font-semibold">SLA Adherence</span>
                <p className="text-3xl font-bold text-purple-500">99.4%</p>
                <p className="text-[10px] text-nexa-text-muted">Zero Critical Breaches</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-nexa-base border border-nexa-border text-xs space-y-2">
              <h4 className="font-semibold text-nexa-text-primary">Supervisor Appraisal Notes ({person.managerName})</h4>
              <p className="text-nexa-text-secondary leading-relaxed">
                Demonstrates high technical rigor and reliable execution. Consistently delivers client requirements on time with zero regressions. Recommended for upcoming senior associate promotion nomination.
              </p>
            </div>
          </div>
        )}

        {/* TAB 11: PROMOTIONS HISTORY */}
        {activeTab === "promotions" && (
          <div className="rounded-xl bg-nexa-surface border border-nexa-border p-6 shadow-xs space-y-6">
            <h3 className="font-semibold text-nexa-text-primary text-sm flex items-center gap-2 border-b border-nexa-border pb-3">
              <Award className="w-4 h-4 text-blue-500" />
              Promotion Nominations & Career Progression
            </h3>

            {personPromotions.length === 0 ? (
              <p className="text-xs text-nexa-text-muted py-6 text-center">
                No active promotion nominations on file for {person.name}.
              </p>
            ) : (
              <div className="space-y-3 text-xs">
                {personPromotions.map((pr) => (
                  <div
                    key={pr.id}
                    className="p-4 rounded-xl bg-nexa-base border border-nexa-border flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-nexa-text-primary text-sm">
                        {pr.currentDesignation} &rarr;{" "}
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">{pr.proposedDesignation}</span>
                      </p>
                      <p className="text-[11px] text-nexa-text-muted mt-1">
                        Nominated by: {pr.nominatedBy} · Tenure: {pr.tenureMonths} mos · Rating: {pr.competencyRating}%
                      </p>
                    </div>
                    <span className="font-mono text-[10px] uppercase px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                      {pr.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 12: DOCUMENTS VAULT */}
        {activeTab === "documents" && (
          <div className="rounded-xl bg-nexa-surface border border-nexa-border p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-nexa-border pb-3">
              <h3 className="font-semibold text-nexa-text-primary text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                Verified Personnel Document Vault ({personDocuments.length})
              </h3>
              <NexaButton
                variant="primary"
                size="sm"
                onClick={() => setIsUploadModalOpen(true)}
                className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-medium"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Upload File
              </NexaButton>
            </div>

            {personDocuments.length === 0 ? (
              <p className="text-xs text-nexa-text-muted py-6 text-center">
                No documents uploaded yet for this individual.
              </p>
            ) : (
              <div className="space-y-3 text-xs">
                {personDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl bg-nexa-base border border-nexa-border flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
                          {doc.documentType}
                        </span>
                        <h4 className="font-bold text-nexa-text-primary text-sm">{doc.title}</h4>
                      </div>
                      <p className="text-[11px] text-nexa-text-muted">
                        Uploaded by: {doc.uploadedBy} · {(doc.fileSizeBytes / 1024 / 1024).toFixed(2)} MB · {doc.createdAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.verified ? (
                        <span className="text-[11px] px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => verifyDocument(doc.id, "Compliance Officer")}
                          className="text-[11px] px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                        >
                          Verify Document
                        </button>
                      )}

                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded bg-nexa-surface text-nexa-text-secondary hover:text-nexa-text-primary border border-nexa-border transition-colors"
                        title="View Document"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => {
                          if (confirm(`Remove document ${doc.title}?`)) {
                            deleteDocument(doc.id);
                          }
                        }}
                        className="p-2 rounded bg-nexa-surface text-nexa-text-muted hover:text-red-600 border border-nexa-border transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 13: CLIENT DEPLOYMENTS */}
        {activeTab === "deployment" && (
          <div className="rounded-xl bg-nexa-surface border border-nexa-border p-6 shadow-xs space-y-6">
            <h3 className="font-semibold text-nexa-text-primary text-sm flex items-center gap-2 border-b border-nexa-border pb-3">
              <Network className="w-4 h-4 text-cyan-500" />
              Client Deployment History & Allocation Rates
            </h3>

            {personDeployments.length === 0 ? (
              <p className="text-xs text-nexa-text-muted py-6 text-center">
                No external client deployments on record for this individual.
              </p>
            ) : (
              <div className="space-y-3 text-xs">
                {personDeployments.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 rounded-xl bg-nexa-base border border-nexa-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 font-bold">
                          {d.status}
                        </span>
                        <h4 className="font-bold text-nexa-text-primary text-sm">{d.clientName}</h4>
                      </div>
                      <p className="text-nexa-text-secondary">
                        Contract: {d.contractTitle} · Role: {d.role} · Allocation: {d.allocationPercent}%
                      </p>
                      <p className="text-nexa-text-muted text-[11px]">
                        Period: {d.startDate} &rarr; {d.endDate}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-nexa-text-primary font-bold">
                        ₦{d.billingRateMonthly.toLocaleString()} / mo
                      </p>
                      <p className="text-[10px] text-nexa-text-muted mt-0.5">
                        Internal Cost: ₦{d.costRateMonthly.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 14: AUDIT TRAIL */}
        {activeTab === "activity" && (
          <div className="rounded-xl bg-nexa-surface border border-nexa-border p-6 shadow-xs space-y-6">
            <h3 className="font-semibold text-nexa-text-primary text-sm flex items-center gap-2 border-b border-nexa-border pb-3">
              <History className="w-4 h-4 text-blue-500" />
              Immutable Activity & Security Audit Trail
            </h3>

            {personAuditLogs.length === 0 ? (
              <p className="text-xs text-nexa-text-muted py-6 text-center">
                No recorded audit events for this person yet.
              </p>
            ) : (
              <div className="space-y-2.5 text-xs">
                {personAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-nexa-base border border-nexa-border flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[11px]">{log.action}</span>
                      <p className="text-nexa-text-secondary mt-0.5">Executed by: {log.actorName}</p>
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <p className="text-[10px] text-nexa-text-muted font-mono mt-0.5">
                          {JSON.stringify(log.changes)}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-nexa-text-muted font-mono">{log.createdAt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL: UPLOAD PERSONNEL DOCUMENT */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-nexa-border pb-3">
                <h3 className="font-semibold text-nexa-text-primary flex items-center gap-2 text-sm">
                  <Upload className="w-4 h-4 text-purple-500" />
                  Upload Personnel Document
                </h3>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-nexa-text-muted hover:text-nexa-text-primary p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUploadDocument} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-nexa-text-secondary font-medium">Document Title / File Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Signed_Employment_Contract_2027.pdf"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-nexa-base border border-nexa-border rounded-lg text-nexa-text-primary placeholder:text-nexa-text-muted focus:outline-none focus:border-purple-500 focus:bg-nexa-surface transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-nexa-text-secondary font-medium">Document Category</label>
                  <select
                    value={docType}
                    onChange={(e: any) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 bg-nexa-base border border-nexa-border rounded-lg text-nexa-text-primary focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="cv">Curriculum Vitae (CV / Resume)</option>
                    <option value="contract">Employment / Fellowship Agreement</option>
                    <option value="nda">Non-Disclosure Agreement (NDA)</option>
                    <option value="certificate">Degree / Professional Certificate</option>
                    <option value="id_card">National ID / Passport Document</option>
                    <option value="other">General Operational Form</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-nexa-text-secondary font-medium">Storage URL (S3 / Cloudinary)</label>
                  <input
                    type="url"
                    placeholder="https://documents.ofia.ng/vault/..."
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-nexa-base border border-nexa-border rounded-lg text-nexa-text-primary placeholder:text-nexa-text-muted focus:outline-none focus:border-purple-500 focus:bg-nexa-surface transition-colors"
                  />
                  <p className="text-[10px] text-nexa-text-muted">Leave blank to use mock enterprise document repository.</p>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="text-xs border-nexa-border text-nexa-text-secondary"
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-xs"
                  >
                    Upload Document
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT PERSONNEL PROFILE */}
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-nexa-border pb-3">
                <h3 className="font-semibold text-nexa-text-primary flex items-center gap-2 text-sm">
                  <Edit2 className="w-4 h-4 text-blue-500" />
                  Edit Personnel Record
                </h3>
                <button
                  onClick={() => setIsEditProfileOpen(false)}
                  className="text-nexa-text-muted hover:text-nexa-text-primary p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-nexa-text-secondary font-medium">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-nexa-base border border-nexa-border rounded-lg text-nexa-text-primary focus:outline-none focus:border-blue-500 focus:bg-nexa-surface transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-nexa-text-secondary font-medium">Phone</label>
                    <input
                      type="text"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-nexa-base border border-nexa-border rounded-lg text-nexa-text-primary focus:outline-none focus:border-blue-500 focus:bg-nexa-surface transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-nexa-text-secondary font-medium">Email</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-nexa-base border border-nexa-border rounded-lg text-nexa-text-primary focus:outline-none focus:border-blue-500 focus:bg-nexa-surface transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-nexa-text-secondary font-medium">Designation</label>
                    <input
                      type="text"
                      required
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value)}
                      className="w-full px-3 py-2 bg-nexa-base border border-nexa-border rounded-lg text-nexa-text-primary focus:outline-none focus:border-blue-500 focus:bg-nexa-surface transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-nexa-text-secondary font-medium">Department</label>
                    <select
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-nexa-base border border-nexa-border rounded-lg text-nexa-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-nexa-text-secondary font-medium">Office Base Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-nexa-base border border-nexa-border rounded-lg text-nexa-text-primary focus:outline-none focus:border-blue-500 focus:bg-nexa-surface transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-nexa-text-secondary font-medium">Residential Address</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-nexa-base border border-nexa-border rounded-lg text-nexa-text-primary focus:outline-none focus:border-blue-500 focus:bg-nexa-surface transition-colors"
                  />
                </div>

                <div className="pt-2 border-t border-nexa-border space-y-3">
                  <span className="font-semibold text-nexa-text-primary block">Emergency Contact</span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-nexa-text-secondary font-medium">Name</label>
                      <input
                        type="text"
                        value={editKinName}
                        onChange={(e) => setEditKinName(e.target.value)}
                        className="w-full px-3 py-2 bg-nexa-base border border-nexa-border rounded-lg text-nexa-text-primary focus:outline-none focus:border-blue-500 focus:bg-nexa-surface transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-nexa-text-secondary font-medium">Relationship</label>
                      <input
                        type="text"
                        value={editKinRel}
                        onChange={(e) => setEditKinRel(e.target.value)}
                        className="w-full px-3 py-2 bg-nexa-base border border-nexa-border rounded-lg text-nexa-text-primary focus:outline-none focus:border-blue-500 focus:bg-nexa-surface transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-nexa-text-secondary font-medium">Phone</label>
                    <input
                      type="text"
                      value={editKinPhone}
                      onChange={(e) => setEditKinPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-nexa-base border border-nexa-border rounded-lg text-nexa-text-primary focus:outline-none focus:border-blue-500 focus:bg-nexa-surface transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="text-xs border-nexa-border text-nexa-text-secondary"
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xs"
                  >
                    Save Changes
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
