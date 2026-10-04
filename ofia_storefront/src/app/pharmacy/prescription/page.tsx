"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MOCK_STORES } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Upload,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ChevronLeft,
  Calendar,
  Lock,
} from "lucide-react";

function PrescriptionContent() {
  const searchParams = useSearchParams();
  const preselectedMed = searchParams.get("medication") || "";

  const store = MOCK_STORES["pharmacy"];

  const [fileName, setFileName] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState(preselectedMed ? `Prescription requested for: ${preselectedMed}` : "");
  const [refillType, setRefillType] = useState<"one-time" | "monthly">("one-time");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) {
      alert("Please upload an image or PDF of your prescription script.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#13221C] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/pharmacy"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Pharmacy</span>
          </Link>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl border border-teal-100 p-8 sm:p-12 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Verification Ticket #RX-{(Math.random() * 90000 + 10000).toFixed(0)}
              </span>
              <h1 className="font-dropa text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                Prescription Uploaded Successfully
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Our resident clinical pharmacist is currently examining your script. We will send you an SMS and WhatsApp confirmation with your medication total and cold-chain dispatch ETA within 15 minutes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 max-w-md mx-auto text-left text-xs space-y-1.5">
              <p><strong>Patient:</strong> {patientName || "Jane Doe"}</p>
              <p><strong>Contact:</strong> {phone || "+234 800 000 0000"}</p>
              <p><strong>Refill Type:</strong> {refillType === "monthly" ? "Automated Monthly Refill" : "One-Time Dispense"}</p>
              <p><strong>Script File:</strong> {fileName}</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/pharmacy"
                className="px-6 py-3 rounded-full bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-xs"
              >
                Return to Dispensary
              </Link>
              <Link
                href="/account"
                className="px-6 py-3 rounded-full border border-teal-200 text-teal-900 font-bold text-xs hover:bg-teal-50"
              >
                View in Account Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2 border-b border-stone-200 pb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-widest">
                <Lock className="w-4 h-4" />
                <span>Encrypted & HIPAA Compliant Transmission</span>
              </div>
              <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
                Upload Medical Prescription (Rx)
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 font-light leading-relaxed">
                Upload a clear photo or digital copy of your doctor&apos;s prescription. Our licensed pharmacists verify authenticity, dosage suitability, and prepare your cold-chain shipment.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-teal-100 p-6 sm:p-10 shadow-xs space-y-8">
              {/* File Upload Drop Area */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-teal-950 block">
                  1. Prescription Image or Document (Required)
                </label>
                <div
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*,.pdf";
                    input.onchange = (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) setFileName(file.name);
                    };
                    input.click();
                  }}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                    fileName
                      ? "border-emerald-500 bg-emerald-50/30"
                      : "border-teal-200 bg-teal-50/30 hover:border-teal-400 hover:bg-teal-50/60"
                  }`}
                >
                  <Upload className={`w-10 h-10 mx-auto mb-3 ${fileName ? "text-emerald-600" : "text-teal-600"}`} />
                  {fileName ? (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-emerald-900">{fileName}</p>
                      <p className="text-xs text-stone-500">Click to change prescription document</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-teal-950">
                        Click or tap to upload prescription script
                      </p>
                      <p className="text-xs text-stone-500">
                        Takes camera snaps, JPG, PNG, or PDF up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Patient Details */}
              <div className="space-y-4 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-teal-950 block">
                  2. Patient & Delivery Information
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-stone-500 block mb-1">
                      Patient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Dr. Ngozi Adeyemi"
                      className="w-full px-4 py-2.5 rounded-full border border-teal-100 bg-teal-50/10 text-xs sm:text-sm text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-500 block mb-1">
                      Phone / WhatsApp for Confirmation
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full px-4 py-2.5 rounded-full border border-teal-100 bg-teal-50/10 text-xs sm:text-sm text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-500 block mb-1">
                    Special Instructions, Allergies, or Desired Brands
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Specify allergies (e.g. Penicillin), preferred brand (e.g. Pfizer, GSK), or specific pack counts..."
                    className="w-full px-4 py-3 rounded-2xl border border-teal-100 bg-teal-50/10 text-xs sm:text-sm text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
              </div>

              {/* Refill Frequency Option */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-teal-950 block">
                  3. Prescription Refill Frequency
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setRefillType("one-time")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      refillType === "one-time"
                        ? "border-teal-700 bg-teal-50 text-teal-950 font-bold shadow-xs"
                        : "border-stone-200 bg-white text-stone-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${refillType === "one-time" ? "border-teal-700" : "border-stone-300"}`}>
                        {refillType === "one-time" && <div className="w-2 h-2 rounded-full bg-teal-700" />}
                      </div>
                      <span className="text-xs font-bold">One-Time Dispensing</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 pl-6">
                      Single fulfillment and immediate dispatch.
                    </p>
                  </div>

                  <div
                    onClick={() => setRefillType("monthly")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      refillType === "monthly"
                        ? "border-teal-700 bg-teal-50 text-teal-950 font-bold shadow-xs"
                        : "border-stone-200 bg-white text-stone-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${refillType === "monthly" ? "border-teal-700" : "border-stone-300"}`}>
                        {refillType === "monthly" && <div className="w-2 h-2 rounded-full bg-teal-700" />}
                      </div>
                      <span className="text-xs font-bold">Automated Monthly Refill</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 pl-6">
                      Never miss a chronic dose. Cold-chain delivery on same date each month.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-full bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Prescription for Pharmacist Verification</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}

export default function PrescriptionUploadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7FAF9] flex items-center justify-center p-8">Loading Prescription Service...</div>}>
      <PrescriptionContent />
    </Suspense>
  );
}
