"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  Briefcase,
  ChevronRight,
  Sparkles,
  Download,
  XCircle,
  Award,
} from "lucide-react";
import { CareersNav } from "../../CareersNav";
import { useWorkforceManager } from "@/lib/workforce-store";
import { WorkforceOffer } from "@/lib/workforce-types";

export default function CandidateOfferAcceptancePage() {
  const params = useParams();
  const token = typeof params?.token === "string" ? params.token : "";

  const { offers, acceptOffer, declineOffer, isLoaded } = useWorkforceManager();
  const [offer, setOffer] = useState<WorkforceOffer | null>(null);
  const [signature, setSignature] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  useEffect(() => {
    if (token) {
      const match = offers.find(
        (o) => o.token.toLowerCase() === token.toLowerCase() || o.id.toLowerCase() === token.toLowerCase()
      );
      if (match) {
        setOffer(match);
      }
    }
  }, [token, offers]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm font-medium">
        Loading offer dossier...
      </div>
    );
  }

  // Realistic fallback if direct token is previewed
  const currentOffer: WorkforceOffer = offer || {
    id: "offer-preview",
    candidateId: "cand-03",
    candidateName: "Bolaji Adeleke",
    candidateEmail: "bolaji.adeleke@yahoo.com",
    roleCategory: "employee",
    offeredDesignation: "Customer Success & Onboarding Specialist",
    department: "Customer Success",
    monthlyStipendSalary: 280000,
    allowances: 40000,
    totalMonthly: 320000,
    startDate: "2027-05-03",
    expiryDate: "2027-04-28",
    offerLetterText: `Dear Bolaji Adeleke,

On behalf of Ofia Enterprise Suite, we are pleased to offer you the full-time position of Customer Success & Onboarding Specialist within our Customer Success Department based in Lagos, Nigeria.

1. Compensation & Remuneration:
- Gross Monthly Base Salary: ₦280,000.00
- Monthly Transport & Operational Allowance: ₦40,000.00
- Total Monthly Remuneration Package: ₦320,000.00 (Subject to statutory PAYE, Pension Reform Act 2014, and NHF contributions)

2. Commencement Date:
Your anticipated start date will be Monday, 3rd May 2027, reporting directly to Ngozi Adeleke (Head of Customer Success).

3. Confidentiality & Non-Disclosure:
This offer is contingent upon your electronic acceptance and the execution of our standard Proprietary Information, Intellectual Property Assignment, and Inventions Agreement.

We look forward to welcoming you to the Ofia team!

Sincerely,
People Operations Department
Ofia Enterprise Suite`,
    token: token || "tok_offer_preview",
    status: "issued",
    createdAt: "2027-04-15",
  };

  const handleAcceptOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signature.trim() || !agreedToTerms) return;

    setIsSubmitting(true);
    try {
      acceptOffer(currentOffer.token, signature.trim(), currentOffer.candidateId);
      setOffer((prev) =>
        prev
          ? {
              ...prev,
              status: "accepted",
              acceptedAt: new Date().toISOString(),
              candidateSignature: signature.trim(),
            }
          : {
              ...currentOffer,
              status: "accepted",
              acceptedAt: new Date().toISOString(),
              candidateSignature: signature.trim(),
            }
      );
    } catch (err) {
      console.error("Failed to accept offer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeclineOffer = () => {
    declineOffer(currentOffer.token, declineReason, currentOffer.candidateId);
    setOffer((prev) =>
      prev ? { ...prev, status: "declined" } : { ...currentOffer, status: "declined" }
    );
    setShowDeclineModal(false);
  };

  const isAccepted = currentOffer.status === "accepted";
  const isDeclined = currentOffer.status === "declined";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <CareersNav />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
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
            <span className="text-slate-700 font-bold">Formal Offer Acceptance</span>
          </div>

          {/* STATUS NOTICES */}
          {isAccepted && (
            <div className="bg-emerald-500 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                    Employment Agreement Executed
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black mt-0.5">Welcome to Ofia Enterprise Suite!</h2>
                  <p className="text-xs text-emerald-100 mt-1">
                    Your electronic signature has been verified and recorded. Onboarding orientation details will be sent
                    to <span className="font-semibold text-white">{currentOffer.candidateEmail}</span>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-white text-emerald-700 font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  Save Agreement PDF
                </button>
              </div>
            </div>
          )}

          {isDeclined && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-3xl p-6 flex items-center gap-4">
              <XCircle className="w-8 h-8 text-rose-600 shrink-0" />
              <div>
                <h3 className="font-bold text-base text-rose-900">Offer Declined</h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  You have recorded your decision to decline this offer. We thank you for your participation in the Ofia
                  evaluation process and wish you continued professional success.
                </p>
              </div>
            </div>
          )}

          {/* FORMAL OFFER LETTER DOSSIER */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-12 shadow-sm relative overflow-hidden">
            {/* Top Seal / Brand Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <img
                  src="https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png"
                  alt="Ofia Enterprise"
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <h2 className="font-black text-xl text-slate-900 tracking-tight">Ofia Enterprise Suite</h2>
                  <p className="text-xs font-semibold text-slate-400">People Operations & Talent Governance</p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Reference Offer Token
                </span>
                <span className="font-mono text-xs font-bold text-slate-800">{currentOffer.token}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Issued: {new Date(currentOffer.createdAt).toLocaleDateString("en-GB")}
                </span>
              </div>
            </div>

            {/* KEY APPOINTMENT PARTICULARS */}
            <div className="my-8 grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Appointed Role</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">{currentOffer.offeredDesignation}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Department</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">{currentOffer.department}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Start Date</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">
                  {new Date(currentOffer.startDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Acceptance By</span>
                <span className="text-sm font-bold text-amber-600 block mt-0.5">
                  {new Date(currentOffer.expiryDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* REMUNERATION SCHEDULE TABLE */}
            <div className="mb-8">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Schedule A: Remuneration & Benefits Breakdown
              </h3>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Remuneration Component</th>
                      <th className="py-3 px-4">Frequency</th>
                      <th className="py-3 px-4 text-right">Amount (NGN ₦)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900">Gross Monthly Base Salary</td>
                      <td className="py-3 px-4 text-slate-500">Monthly</td>
                      <td className="py-3 px-4 font-bold text-right text-slate-900">
                        ₦{currentOffer.monthlyStipendSalary.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-900">Transport & Operational Allowance</td>
                      <td className="py-3 px-4 text-slate-500">Monthly</td>
                      <td className="py-3 px-4 font-bold text-right text-slate-900">
                        ₦{currentOffer.allowances.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-blue-50/50">
                      <td className="py-3.5 px-4 font-black text-slate-900">Total Monthly Guaranteed Remuneration</td>
                      <td className="py-3.5 px-4 font-semibold text-blue-700">Monthly (Gross)</td>
                      <td className="py-3.5 px-4 font-black text-right text-base text-blue-700">
                        ₦{currentOffer.totalMonthly.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td className="py-3 px-4">Annualized Gross Compensation</td>
                      <td className="py-3 px-4 text-slate-500">Annual (12 Months)</td>
                      <td className="py-3 px-4 text-right font-black">
                        ₦{(currentOffer.totalMonthly * 12).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                * All emoluments are subject to statutory statutory deductions pursuant to the Personal Income Tax Act
                (PITA), Pension Reform Act 2014, and applicable national health regulations.
              </p>
            </div>

            {/* FORMAL OFFER LETTER BODY */}
            <div className="mb-8">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Schedule B: Formal Letter of Appointment
              </h3>
              <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl whitespace-pre-line font-sans text-xs sm:text-sm text-slate-700 leading-relaxed max-h-96 overflow-y-auto">
                {currentOffer.offerLetterText}
              </div>
            </div>

            {/* ELECTRONIC ACCEPTANCE EXECUTION PAD */}
            {!isAccepted && !isDeclined && (
              <form onSubmit={handleAcceptOffer} className="pt-6 border-t border-slate-200 space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Electronic Acceptance & Execution
                  </h3>
                  <p className="text-xs text-slate-500">
                    To accept this formal offer of appointment, please type your full legal name below as your binding
                    electronic signature.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Type Full Legal Name (Electronic Signature)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bolaji Adeleke"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-serif text-base sm:text-lg italic text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <label className="flex items-start gap-3 p-4 bg-blue-50/50 border border-blue-200/60 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-700 leading-relaxed font-medium">
                      I, <strong className="text-slate-900">{signature || currentOffer.candidateName}</strong>, confirm
                      that I have read, understood, and voluntarily agree to the terms, compensation, and conditions of
                      appointment set forth in this Offer Letter.
                    </span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowDeclineModal(true)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                  >
                    Decline this Offer
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !signature.trim() || !agreedToTerms}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:shadow-none"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isSubmitting ? "Executing Acceptance..." : "Execute & Accept Offer of Employment"}
                  </button>
                </div>
              </form>
            )}

            {isAccepted && (
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>
                    Digitally signed by <strong className="text-slate-800">{currentOffer.candidateSignature}</strong> on{" "}
                    {currentOffer.acceptedAt ? new Date(currentOffer.acceptedAt).toLocaleString() : "Date of Record"}.
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">Status: BINDING / EXECUTED</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* DECLINE CONFIRMATION MODAL */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Decline Employment Offer?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you wish to decline this appointment? This action is permanent and will notify the People
              Operations committee.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason for Declining (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Accepted another offer, compensation mismatch, relocation..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeclineModal(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeclineOffer}
                className="px-4 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 shadow-sm"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
