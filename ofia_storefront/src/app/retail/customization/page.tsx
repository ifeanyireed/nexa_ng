"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_STORES, MOCK_SERVICES } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Gift,
  PenTool,
  CheckCircle2,
  ChevronLeft,
  Calendar,
  Award,
  Package,
} from "lucide-react";

export default function RetailCustomizationPage() {
  const store = MOCK_STORES["retail"];
  const services = MOCK_SERVICES.filter((s) => s.vertical === "retail");

  const [activeTab, setActiveTab] = useState<"registry" | "engraving" | "preorder">("registry");
  const [registryType, setRegistryType] = useState<"wedding" | "baby" | "birthday">("wedding");
  const [registryTitle, setRegistryTitle] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("2026-12-10");
  const [engravingText, setEngravingText] = useState("");
  const [itemType, setItemType] = useState("Anthology Hardcover Book");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#222129] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/retail"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-900 hover:text-purple-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Specialty Store</span>
          </Link>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl border border-purple-100 p-8 sm:p-12 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                Registry / Atelier ID #RTL-{(Math.random() * 90000 + 10000).toFixed(0)}
              </span>
              <h1 className="font-dropa text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                {activeTab === "registry"
                  ? "Gift Registry Created Successfully"
                  : activeTab === "engraving"
                  ? "Custom Inscription Order Logged"
                  : "Pre-Order Reservation Secured"}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                {activeTab === "registry"
                  ? `Your ${registryType} registry "${registryTitle || "Celebration Registry"}" is now active. Share your unique link with guests for automated doorstep fulfillment and wax-sealed wrapping.`
                  : "Our master engraver has reviewed your dedication text. We will craft the laser plate and confirm packaging proof via WhatsApp before dispatch."}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/retail"
                className="px-6 py-3 rounded-full bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs shadow-xs"
              >
                Return to Store
              </Link>
              <Link
                href="/account"
                className="px-6 py-3 rounded-full border border-purple-200 text-purple-950 font-bold text-xs hover:bg-purple-50"
              >
                View in Account Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2 border-b border-stone-200 pb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-800 uppercase tracking-widest">
                <Gift className="w-4 h-4" />
                <span>Specialty Gift Atelier & Registry Studio</span>
              </div>
              <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
                Gift Registries, Laser Inscriptions & Pre-Orders
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 font-light leading-relaxed">
                Create customized gift registries for life milestones, order bespoke laser engraving on brass dedication plates, or reserve upcoming literary and fitness drops.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-purple-100/70 p-1 rounded-full max-w-md">
              <button
                onClick={() => setActiveTab("registry")}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === "registry"
                    ? "bg-purple-900 text-white shadow-xs"
                    : "text-purple-950 hover:text-purple-800"
                }`}
              >
                Gift Registry
              </button>
              <button
                onClick={() => setActiveTab("engraving")}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === "engraving"
                    ? "bg-purple-900 text-white shadow-xs"
                    : "text-purple-950 hover:text-purple-800"
                }`}
              >
                Laser Engraving
              </button>
              <button
                onClick={() => setActiveTab("preorder")}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === "preorder"
                    ? "bg-purple-900 text-white shadow-xs"
                    : "text-purple-950 hover:text-purple-800"
                }`}
              >
                Pre-Orders
              </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-10 shadow-xs space-y-8">
              {activeTab === "registry" ? (
                <>
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                      1. Registry Occasion
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["wedding", "baby", "birthday"] as const).map((type) => (
                        <div
                          key={type}
                          onClick={() => setRegistryType(type)}
                          className={`p-3.5 rounded-2xl border text-center cursor-pointer capitalize font-bold text-xs transition-all ${
                            registryType === type
                              ? "border-purple-900 bg-purple-50 text-purple-900 shadow-xs"
                              : "border-stone-200 bg-white text-stone-600 hover:border-purple-200"
                          }`}
                        >
                          {type} Celebration
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-stone-500 block mb-1">
                        Registry Title
                      </label>
                      <input
                        type="text"
                        required
                        value={registryTitle}
                        onChange={(e) => setRegistryTitle(e.target.value)}
                        placeholder="e.g. Tunde & Folake's Wedding Wishlist"
                        className="w-full px-4 py-2.5 rounded-full border border-purple-100 bg-purple-50/20 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-stone-500 block mb-1">
                        Event Date
                      </label>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-full border border-purple-100 bg-purple-50/20 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-900"
                      />
                    </div>
                  </div>
                </>
              ) : activeTab === "engraving" ? (
                <>
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                      Item to Personalize
                    </label>
                    <select
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-full border border-purple-100 bg-purple-50/20 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-900"
                    >
                      <option value="Anthology Hardcover Book">Anthology Hardcover Book (Brass Plate / Spine Inscription)</option>
                      <option value="DialTech Dumbbells">DialTech Dumbbells (Laser-Marked Name Badge)</option>
                      <option value="Montessori Sensory Cube">Montessori Wooden Box (Laser Carved Lid)</option>
                      <option value="Other Specialty Keepsake">Other Specialty Keepsake</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-500 block mb-1">
                      Custom Inscription Text (Max 40 Characters)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={40}
                      value={engravingText}
                      onChange={(e) => setEngravingText(e.target.value)}
                      placeholder="e.g. 'To David, With All Our Love · 2026'"
                      className="w-full px-4 py-2.5 rounded-full border border-purple-100 bg-purple-50/20 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-900"
                    />
                  </div>
                </>
              ) : (
                /* Pre-orders */
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <p className="font-bold">Upcoming Limited Drops</p>
                    <p>Reserve numbered first-edition anthologies and Olympic barbell sets prior to public release date with zero cancellation fees.</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-500 block mb-1">
                      Select Upcoming Release
                    </label>
                    <select className="w-full px-4 py-2.5 rounded-full border border-purple-100 bg-purple-50/20 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-900">
                      <option>Chinua Achebe Restored Manuscript Anthology (Nov 2026)</option>
                      <option>Pro-Core Olympic Bumper Plates 100kg Set (Dec 2026)</option>
                      <option>Hand-Carved Cedar Acoustic Kalimba (Nov 2026)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Organizer Contact */}
              <div className="space-y-4 pt-2 border-t border-purple-50">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                  Organizer Contact Information
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-stone-500 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={organizerName}
                      onChange={(e) => setOrganizerName(e.target.value)}
                      placeholder="e.g. Folake Adebayo"
                      className="w-full px-4 py-2.5 rounded-full border border-purple-100 bg-purple-50/20 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-500 block mb-1">
                      Phone Number / WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full px-4 py-2.5 rounded-full border border-purple-100 bg-purple-50/20 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-900"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-full bg-purple-900 hover:bg-purple-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>
                    {activeTab === "registry"
                      ? "Create Live Registry & Generate Link"
                      : activeTab === "engraving"
                      ? "Log Custom Engraving Request"
                      : "Confirm Pre-Order Reservation"}
                  </span>
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
