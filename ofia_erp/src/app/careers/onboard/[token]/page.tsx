"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  UserCheck,
  Building2,
  CreditCard,
  Laptop,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Phone,
  Home,
  Check,
  Download,
} from "lucide-react";
import { CareersNav } from "../../CareersNav";
import { useWorkforceManager } from "@/lib/workforce-store";
import { NIGERIAN_BANKS, NIGERIAN_PFAS } from "@/lib/workforce-defaults";
import { WorkforceOnboardingPacket } from "@/lib/workforce-types";

export default function CandidateOnboardingIntakePage() {
  const params = useParams();
  const token = typeof params?.token === "string" ? params.token : "";

  const { onboardingPackets, submitOnboardingDossier, isLoaded } = useWorkforceManager();
  const [packet, setPacket] = useState<WorkforceOnboardingPacket | null>(null);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Form State
  const [nin, setNin] = useState("");
  const [bvn, setBvn] = useState("");
  const [residentialAddress, setResidentialAddress] = useState("");

  const [bankName, setBankName] = useState(NIGERIAN_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [pfaName, setPfaName] = useState(NIGERIAN_PFAS[0]);
  const [rsaPin, setRsaPin] = useState("");

  const [nokName, setNokName] = useState("");
  const [nokRelationship, setNokRelationship] = useState("Spouse");
  const [nokPhone, setNokPhone] = useState("");
  const [nokAddress, setNokAddress] = useState("");

  const [laptopPref, setLaptopPref] = useState<
    "MacBook Pro / M-Series" | "Lenovo ThinkPad X1" | "Dell XPS Enterprise" | "Bring Your Own Device (BYOD)"
  >("MacBook Pro / M-Series");
  const [requiresMonitor, setRequiresMonitor] = useState(true);
  const [requiresSecurityKey, setRequiresSecurityKey] = useState(true);

  const [docOfferSigned, setDocOfferSigned] = useState(true);
  const [docAddressProof, setDocAddressProof] = useState(true);
  const [docNysc, setDocNysc] = useState(true);
  const [docGovId, setDocGovId] = useState(true);
  const [docPhoto, setDocPhoto] = useState(true);

  useEffect(() => {
    if (token) {
      const match = onboardingPackets.find(
        (p) => p.token.toLowerCase() === token.toLowerCase() || p.id.toLowerCase() === token.toLowerCase()
      );
      if (match) {
        setPacket(match);
        if (match.nin) setNin(match.nin);
        if (match.bvn) setBvn(match.bvn);
        if (match.residentialAddress) setResidentialAddress(match.residentialAddress);
        if (match.bankDetails) {
          setBankName(match.bankDetails.bankName || NIGERIAN_BANKS[0]);
          setAccountNumber(match.bankDetails.accountNumber || "");
          setAccountName(match.bankDetails.accountName || "");
          setPfaName(match.bankDetails.pfaName || NIGERIAN_PFAS[0]);
          setRsaPin(match.bankDetails.rsaPin || "");
        }
        if (match.nextOfKin) {
          setNokName(match.nextOfKin.name || "");
          setNokRelationship(match.nextOfKin.relationship || "Spouse");
          setNokPhone(match.nextOfKin.phone || "");
          setNokAddress(match.nextOfKin.address || "");
        }
        if (match.equipmentRequisition) {
          setLaptopPref(match.equipmentRequisition.laptopPreference || "MacBook Pro / M-Series");
          setRequiresMonitor(Boolean(match.equipmentRequisition.requiresMonitor));
          setRequiresSecurityKey(Boolean(match.equipmentRequisition.requiresSecurityKey));
        }
        if (match.status === "in_review" || match.status === "approved" || match.status === "provisioned") {
          setIsSubmittedSuccess(true);
        }
      }
    }
  }, [token, onboardingPackets]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm font-medium">
        Loading onboarding intake dossier...
      </div>
    );
  }

  const currentPacket: WorkforceOnboardingPacket = packet || {
    id: "onb-preview",
    candidateId: "cand-03",
    candidateName: "Bolaji Adeleke",
    candidateEmail: "bolaji.adeleke@yahoo.com",
    designation: "Customer Success & Onboarding Specialist",
    department: "Customer Success",
    roleCategory: "employee",
    token: token || "tok_onb_preview",
    status: "pending_intake",
    createdAt: "2027-04-16",
  };

  const handleSubmitAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      submitOnboardingDossier(currentPacket.token, {
        nin,
        bvn,
        residentialAddress,
        bankDetails: {
          bankName,
          accountNumber,
          accountName: accountName || currentPacket.candidateName,
          pfaName,
          rsaPin,
        },
        nextOfKin: {
          name: nokName,
          relationship: nokRelationship,
          phone: nokPhone,
          address: nokAddress || residentialAddress,
        },
        equipmentRequisition: {
          laptopPreference: laptopPref,
          requiresMonitor,
          requiresSecurityKey,
          dispatchStatus: "pending",
        },
        documentsSubmitted: {
          offerLetterSigned: docOfferSigned,
          proofOfAddress: docAddressProof,
          nyscCertificate: docNysc,
          governmentId: docGovId,
          passportPhoto: docPhoto,
        },
      });
      setIsSubmittedSuccess(true);
    } catch (err) {
      console.error("Failed to submit onboarding dossier:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: "Identity & Residence" },
    { num: 2, title: "Payroll & Banking" },
    { num: 3, title: "Next of Kin" },
    { num: 4, title: "Equipment & Assets" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <CareersNav />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/careers" className="hover:text-blue-600 transition-colors">
              Careers
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/careers/status" className="hover:text-blue-600 transition-colors">
              Application Tracker
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-bold">Staff Onboarding Intake</span>
          </div>

          {isSubmittedSuccess ? (
            <div className="bg-white border border-emerald-100 rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Onboarding Packet Under Review
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Welcome to the Team, {currentPacket.candidateName}!
                </h1>
                <p className="text-sm text-slate-500 max-w-lg mx-auto">
                  Your statutory verification, remuneration banking details, and workstation requirements have been
                  securely routed to People Operations and IT Asset Management.
                </p>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-left max-w-md mx-auto space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Designation</span>
                  <span className="font-bold text-slate-900">{currentPacket.designation}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Department</span>
                  <span className="font-bold text-slate-900">{currentPacket.department}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Corporate Email (Pending)</span>
                  <span className="font-mono font-bold text-blue-600">
                    {currentPacket.systemAccount?.corporateEmail ||
                      `${currentPacket.candidateName.toLowerCase().replace(/\s+/g, ".")}@ofia.ng`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Equipment Provisioning</span>
                  <span className="font-bold text-emerald-600 uppercase text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Assigned to IT Logistics
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/careers/status"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20"
                >
                  Return to Application Status
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4" />
                    New Hire Onboarding Intake
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {currentPacket.candidateName}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Appointed as:{" "}
                    <strong className="text-slate-800">{currentPacket.designation}</strong> in{" "}
                    <strong className="text-slate-800">{currentPacket.department}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Intake Token
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800">{currentPacket.token}</span>
                </div>
              </div>

              {/* Step Navigation Indicator */}
              <div className="grid grid-cols-4 gap-2">
                {steps.map((s) => {
                  const isActive = currentStep === s.num;
                  const isDone = currentStep > s.num;
                  return (
                    <button
                      type="button"
                      key={s.num}
                      onClick={() => setCurrentStep(s.num)}
                      className={`text-left p-2.5 rounded-xl border transition-all ${
                        isActive
                          ? "bg-blue-50 border-blue-400"
                          : isDone
                          ? "bg-slate-50 border-emerald-300"
                          : "bg-white border-slate-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isDone
                              ? "bg-emerald-500 text-white"
                              : isActive
                              ? "bg-blue-600 text-white"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {isDone ? <Check className="w-3 h-3" /> : s.num}
                        </span>
                        <span
                          className={`text-xs font-bold truncate ${
                            isActive ? "text-blue-900" : isDone ? "text-emerald-800" : "text-slate-600"
                          }`}
                        >
                          {s.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* FORM SECTIONS */}
              <form onSubmit={handleSubmitAll} className="space-y-6">
                {/* STEP 1: IDENTITY & STATUTORY */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-base font-bold text-slate-900">National Identity & Residential Records</h3>
                      <p className="text-xs text-slate-500">
                        Required for payroll statutory compliance and Lagos State internal revenue registration (LIRS).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          National Identity Number (NIN - 11 Digits)
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={11}
                          placeholder="e.g. 48291039481"
                          value={nin}
                          onChange={(e) => setNin(e.target.value.replace(/\D/g, ""))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Bank Verification Number (BVN - 11 Digits)
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={11}
                          placeholder="e.g. 22194830192"
                          value={bvn}
                          onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Current Residential Address (Nigeria)
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos"
                        value={residentialAddress}
                        onChange={(e) => setResidentialAddress(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: REMUNERATION & BANKING */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-base font-bold text-slate-900">Nigerian Salary Bank & Pension (PFA)</h3>
                      <p className="text-xs text-slate-500">
                        Monthly emoluments will be deposited directly via NIBSS Instant Payments to this verified account.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Commercial / Digital Bank
                        </label>
                        <select
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {NIGERIAN_BANKS.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          NUBAN Account Number (10 Digits)
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={10}
                          placeholder="e.g. 0128492019"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Account Name (As registered with your bank)
                      </label>
                      <input
                        type="text"
                        placeholder={currentPacket.candidateName}
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Pension Fund Administrator (PFA)
                        </label>
                        <select
                          value={pfaName}
                          onChange={(e) => setPfaName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {NIGERIAN_PFAS.map((pfa) => (
                            <option key={pfa} value={pfa}>
                              {pfa}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Retirement Savings Account (RSA PIN)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. PEN100948201948"
                          value={rsaPin}
                          onChange={(e) => setRsaPin(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: NEXT OF KIN */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-base font-bold text-slate-900">Next of Kin & Emergency Contact</h3>
                      <p className="text-xs text-slate-500">
                        Designated point of contact for company group life assurance and medical emergencies.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Next of Kin Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Funmilayo Adeleke"
                          value={nokName}
                          onChange={(e) => setNokName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Relationship
                        </label>
                        <select
                          value={nokRelationship}
                          onChange={(e) => setNokRelationship(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Spouse">Spouse</option>
                          <option value="Parent">Parent</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Child">Child</option>
                          <option value="Guardian">Guardian / Relative</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. +234 803 492 8190"
                          value={nokPhone}
                          onChange={(e) => setNokPhone(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Address (Leave blank if same as yours)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Same as residential"
                          value={nokAddress}
                          onChange={(e) => setNokAddress(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: EQUIPMENT & ASSET PREFERENCES */}
                {currentStep === 4 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-base font-bold text-slate-900">Workstation & IT Requisition</h3>
                      <p className="text-xs text-slate-500">
                        Select your standardized enterprise equipment. Delivered to your home or collected at Lagos HQ.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Preferred Primary Machine
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          "MacBook Pro / M-Series",
                          "Lenovo ThinkPad X1",
                          "Dell XPS Enterprise",
                          "Bring Your Own Device (BYOD)",
                        ].map((item) => (
                          <button
                            type="button"
                            key={item}
                            onClick={() => setLaptopPref(item as any)}
                            className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                              laptopPref === item
                                ? "bg-blue-50/80 border-blue-400 text-blue-900 shadow-sm"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Laptop className={`w-4 h-4 ${laptopPref === item ? "text-blue-600" : "text-slate-400"}`} />
                              <span className="text-xs font-bold">{item}</span>
                            </div>
                            {laptopPref === item && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          checked={requiresMonitor}
                          onChange={(e) => setRequiresMonitor(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300"
                        />
                        <span>Request External 27" 4K IPS Ergonomic Monitor</span>
                      </label>
                      <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          checked={requiresSecurityKey}
                          onChange={(e) => setRequiresSecurityKey(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300"
                        />
                        <span>Request Yubikey Hardware 2FA Security Token</span>
                      </label>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Statutory Document Verification
                      </h4>
                      <div className="space-y-2 text-xs text-slate-700">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={docOfferSigned}
                            onChange={(e) => setDocOfferSigned(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span>Signed Employment Offer Letter</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={docAddressProof}
                            onChange={(e) => setDocAddressProof(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span>Proof of Residence (Utility Bill / Tenancy)</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={docNysc}
                            onChange={(e) => setDocNysc(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span>NYSC Certificate of National Service / Exemption</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={docGovId}
                            onChange={(e) => setDocGovId(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span>Valid Government ID (National e-ID / Voters Card / International Passport)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* BOTTOM BUTTONS */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => prev - 1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => prev + 1)}
                      className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20"
                    >
                      Continue <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isSubmitting ? "Submitting Packet..." : "Submit Completed Onboarding Dossier"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
