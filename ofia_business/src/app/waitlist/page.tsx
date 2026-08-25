"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Plus,
  Share2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";

const NIGERIAN_STATES = [
  "Lagos",
  "Abuja FCT",
  "Rivers",
  "Kano",
  "Oyo",
  "Enugu",
  "Delta",
  "Anambra",
  "Edo",
  "Ogun",
  "Kaduna",
  "Akwa Ibom",
  "Cross River",
  "Imo",
  "Abia",
  "Ondo",
  "Plateau",
  "Kwara",
];

const BUSINESS_TYPES = [
  "Retail Store / Supermarket",
  "Fashion & Apparel",
  "Solar & Renewable Energy",
  "Automotive & Spare Parts",
  "Pharmacy & Healthcare",
  "Logistics & Transport",
  "Restaurant & Food Service",
  "Real Estate & Construction",
  "Professional & Legal Services",
  "Technology & Software",
  "Education & Training",
  "Beauty & Personal Care",
  "Events & Hospitality",
  "Agriculture & Commodities",
  "Manufacturing & Production",
  "Other (Type below)",
];

const TOOL_TYPES = [
  "Multiple Cuisines, Restaurant & Cloud Kitchen Suite",
  "Hospital, Clinic & Healthcare Management Suite",
  "Hotel, Resort & Hospitality Management Suite",
  "Pharmacy, Drugs & Prescription Dispensary Suite",
  "School, College & Academy Management Suite",
  "Real Estate, Facility & Tenant Management Suite",
  "Logistics, Haulage & Waybill Fleet Suite",
  "Solar, Inverter & Renewable Energy Field Suite",
  "Supermarket, Wholesale & Multi-Warehouse IMS Suite",
  "Automotive Garage, Dealership & Spare Parts Suite",
  "Law Firm, Legal Practice & Retainer Suite",
  "Event Center, Hall Rental & Sound Stage Suite",
  "Beauty Salon, Spa Wellness & Barbershop Suite",
  "Autonomous AI Outreach & SDR Marketing Swarm",
  "Multi-Store POS & Cashier Desk Registers",
  "Milestone Escrow & Automated Invoicing",
  "Double-Entry Accounting & General Ledger",
  "HR, Staff Attendance, Payroll & Appraisals",
  "WhatsApp Meta Cloud API CRM & Live Automation",
  "B2B Sales Pipelines & Corporate Deal Desk",
  "Other (Type below)",
];

export default function WaitlistPage() {
  const heroImages = [
    "/hero5.jpeg",
    "/hero6.jpeg",
    "/hero7.jpeg",
    "/hero8.jpeg",
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const imgInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(imgInterval);
  }, [heroImages.length]);

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [customBusinessType, setCustomBusinessType] = useState("");

  // Multi-select for tools of interest
  const [selectedTools, setSelectedTools] = useState<string[]>([TOOL_TYPES[0]]);
  const [customToolInput, setCustomToolInput] = useState("");
  const [isAddingCustomTool, setIsAddingCustomTool] = useState(false);

  const [state, setState] = useState("Lagos");
  const [city, setCity] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleToolSelect = (value: string) => {
    if (value === "Other (Type below)") {
      setIsAddingCustomTool(true);
      return;
    }
    if (!selectedTools.includes(value)) {
      setSelectedTools((prev) => [...prev, value]);
    }
  };

  const handleAddCustomTool = () => {
    if (customToolInput.trim() && !selectedTools.includes(customToolInput.trim())) {
      setSelectedTools((prev) => [...prev, customToolInput.trim()]);
      setCustomToolInput("");
      setIsAddingCustomTool(false);
    }
  };

  const handleRemoveTool = (toolToRemove: string) => {
    setSelectedTools((prev) => prev.filter((t) => t !== toolToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !businessName.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (selectedTools.length === 0) {
      setErrorMessage("Please select at least one tool of interest.");
      return;
    }

    const resolvedBiz =
      businessType === "Other (Type below)" || customBusinessType.trim()
        ? customBusinessType.trim() || "Custom Business"
        : businessType;

    const resolvedTools = selectedTools.join(", ");

    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          businessName,
          email,
          phone,
          businessType: resolvedBiz,
          toolType: resolvedTools,
          customBusinessType,
          state,
          city,
          featuresInterest: selectedTools,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit registration.");
      }

      setSubmittedData(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!submittedData?.referralLink) return;
    navigator.clipboard.writeText(submittedData.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center py-12 md:py-16 px-4 sm:px-6 lg:px-12 overflow-hidden bg-slate-50 font-sans">
      {/* Background image & gradient blur overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={heroImages[currentImageIndex]}
            src={heroImages[currentImageIndex]}
            alt="Hero background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </AnimatePresence>

        {/* Water translucent blurry overlay */}
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(24px) saturate(220%) brightness(1.05)",
            WebkitBackdropFilter: "blur(24px) saturate(220%) brightness(1.05)",
            maskImage: "linear-gradient(to right, black 25%, transparent 75%)",
            WebkitMaskImage: "linear-gradient(to right, black 25%, transparent 75%)",
          }}
        />

        {/* Vertical gradient tending towards the header area */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white via-white/90 to-transparent" />

        {/* Left horizontal gradient to shield text content */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 via-30% to-transparent" />
      </div>

      {/* Top Left Brand Anchor */}
      <div className="absolute top-6 left-6 md:top-8 md:left-12 z-20 flex items-center gap-2.5">
        <img src="/logo.png" alt="Ofia" className="w-8 h-8 object-contain" />
        <span className="text-base font-extrabold tracking-tight text-slate-900">
          Ofia
        </span>
      </div>

      {/* Main Two-Column Structure */}
      <div className="container mx-auto max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 flex flex-col items-start text-left pt-6 lg:pt-0 max-w-lg"
        >
          <span className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-3">
            Early Access
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.12] tracking-tight">
            Run your business on <span className="text-nexa-brand">Ofia.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-700 mt-4 max-w-md leading-relaxed">
            Discover, book, buy — all in one place. Nigeria's most trusted business operating system.
          </p>

          <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Priority onboarding opening soon</span>
          </div>
        </motion.div>

        {/* Right Column: Embedded Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="lg:col-span-5 w-full flex justify-center lg:justify-end"
        >
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xl rounded-3xl p-5 sm:p-6 text-left max-w-[430px] w-full">
            {!submittedData ? (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Join the waitlist
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Reserve your priority spot for early access.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                    {errorMessage}
                  </div>
                )}

                {/* Name & Business */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Babatunde Adeleke"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-white border border-slate-200 rounded-full w-full h-11 px-4 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-nexa-brand/20 focus:border-nexa-brand focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Enterprise"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="bg-white border border-slate-200 rounded-full w-full h-11 px-4 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-nexa-brand/20 focus:border-nexa-brand focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.ng"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white border border-slate-200 rounded-full w-full h-11 px-4 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-nexa-brand/20 focus:border-nexa-brand focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">
                      WhatsApp / Phone
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+234 800 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-white border border-slate-200 rounded-full w-full h-11 px-4 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-nexa-brand/20 focus:border-nexa-brand focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Business Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">
                    Business Type
                  </label>
                  <div className="relative">
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="bg-white border border-slate-200 rounded-full w-full h-11 px-4 pr-10 text-xs text-slate-800 focus:ring-2 focus:ring-nexa-brand/20 focus:border-nexa-brand focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                      {BUSINESS_TYPES.map((bt) => (
                        <option key={bt} value={bt}>
                          {bt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
                  </div>
                  {businessType === "Other (Type below)" && (
                    <input
                      type="text"
                      placeholder="Specify your business type..."
                      value={customBusinessType}
                      onChange={(e) => setCustomBusinessType(e.target.value)}
                      className="bg-white border border-slate-200 rounded-full w-full h-10 px-4 mt-2 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-nexa-brand/20 focus:border-nexa-brand focus:outline-none transition-all"
                    />
                  )}
                </div>

                {/* Tool of Interest (Multi-Select with Stacked Items) */}
                <div>
                  <div className="flex items-center justify-between mb-1 ml-1 mr-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Tools of Interest
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Select multiple
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleToolSelect(e.target.value);
                        }
                      }}
                      className="bg-white border border-slate-200 rounded-full w-full h-11 px-4 pr-10 text-xs text-slate-800 focus:ring-2 focus:ring-nexa-brand/20 focus:border-nexa-brand focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        + Add a tool or feature...
                      </option>
                      {TOOL_TYPES.map((tt) => (
                        <option
                          key={tt}
                          value={tt}
                          disabled={selectedTools.includes(tt) && tt !== "Other (Type below)"}
                        >
                          {selectedTools.includes(tt) ? `✓ ${tt}` : tt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
                  </div>

                  {/* Custom Tool Text Input */}
                  {isAddingCustomTool && (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Type custom tool or module..."
                        value={customToolInput}
                        onChange={(e) => setCustomToolInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomTool();
                          }
                        }}
                        className="bg-white border border-slate-200 rounded-full flex-1 h-10 px-4 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-nexa-brand/20 focus:border-nexa-brand focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomTool}
                        className="h-10 px-4 rounded-full bg-nexa-brand text-white text-xs font-bold hover:bg-nexa-brand/90 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingCustomTool(false)}
                        className="h-10 w-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* AUTO-FIT WRAPPED SELECTED ITEMS */}
                  {selectedTools.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {selectedTools.map((tool) => (
                        <div
                          key={tool}
                          className="inline-flex w-fit max-w-full items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-950 text-xs font-medium transition-all shadow-sm"
                        >
                          <span className="truncate">{tool}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTool(tool)}
                            className="text-blue-500 hover:text-blue-800 p-0.5 rounded-full hover:bg-blue-200/60 transition-colors cursor-pointer shrink-0"
                            title="Remove tool"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* State & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">
                      State
                    </label>
                    <div className="relative">
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="bg-white border border-slate-200 rounded-full w-full h-11 px-4 pr-10 text-xs text-slate-800 focus:ring-2 focus:ring-nexa-brand/20 focus:border-nexa-brand focus:outline-none transition-all appearance-none cursor-pointer"
                      >
                        {NIGERIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">
                      City (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ikeja, Lekki, Garki"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-white border border-slate-200 rounded-full w-full h-11 px-4 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-nexa-brand/20 focus:border-nexa-brand focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Fully Rounded Submit Button */}
                <div className="pt-2">
                  <NexaButton
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="w-full h-12 rounded-full bg-nexa-brand hover:bg-nexa-brand/90 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      <span>Join Waitlist</span>
                    )}
                  </NexaButton>
                </div>
              </form>
            ) : (
              /* Success Ticket */
              <div className="text-center py-4 space-y-5">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    You're on the list
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Thanks, <strong>{submittedData.lead?.fullName}</strong>. We will reach out on WhatsApp and email as onboarding begins.
                  </p>
                </div>

                {/* Ticket Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Queue Position</span>
                    <span className="font-mono text-sm font-bold text-nexa-brand">
                      #OFIA-{String(submittedData.queueNumber).padStart(4, "0")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Business</span>
                    <span className="font-semibold text-slate-900 truncate">
                      {submittedData.lead?.businessName}
                    </span>
                  </div>
                  {submittedData.lead?.featuresInterest && (
                    <div className="pt-1.5 border-t border-slate-200/80">
                      <span className="text-slate-500 block mb-1 text-[11px]">Selected Tools:</span>
                      <div className="flex flex-col gap-1">
                        {submittedData.lead.featuresInterest.map((item: string) => (
                          <span key={item} className="text-[11px] font-medium text-slate-800">
                            • {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Referral Link with Fully Rounded Elements */}
                <div className="space-y-2 text-left">
                  <span className="text-xs font-semibold text-slate-700 block ml-1">
                    Share with other business owners:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={submittedData.referralLink}
                      className="flex-1 h-11 px-4 rounded-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="h-11 px-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Join the early access waitlist for Ofia Business OS: ${submittedData.referralLink}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-11 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm mt-3"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share on WhatsApp</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setSubmittedData(null)}
                  className="text-xs text-slate-500 hover:text-blue-600 underline cursor-pointer"
                >
                  Register another business
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
