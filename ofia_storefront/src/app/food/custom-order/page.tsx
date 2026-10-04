"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_STORES } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  ChefHat,
  Calendar,
  Users,
  UtensilsCrossed,
  Sparkles,
  ChevronLeft,
  Check,
  Send,
  Cake,
  Clock,
} from "lucide-react";

export default function FoodCustomOrderPage() {
  const store = MOCK_STORES.food;

  const [eventType, setEventType] = useState<
    "Celebration Cake" | "Private Chef Dining" | "Corporate Executive Catering" | "Wedding Reception"
  >("Celebration Cake");

  const [targetDate, setTargetDate] = useState("2026-10-15");
  const [guestCount, setGuestCount] = useState<number>(25);
  const [flavorTheme, setFlavorTheme] = useState("");
  const [budgetRange, setBudgetRange] = useState("₦50,000 - ₦150,000");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    const ref = `CUST-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(ref);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#1E1B18] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <Link
          href="/food/menu"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-amber-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </Link>

        {submitted ? (
          /* Confirmation Screen */
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-stone-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                Order Ticket: {ticketId}
              </span>
              <h1 className="font-dropa text-3xl font-bold text-zinc-900">
                Custom Culinary Request Received!
              </h1>
              <p className="text-stone-600 text-sm max-w-md mx-auto">
                Our Executive Chef and Pastry Atelier team have received your request for <strong>{eventType}</strong>.
              </p>
            </div>

            <div className="max-w-md mx-auto p-5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-left space-y-2.5">
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Event / Order:</span>
                <span className="font-bold text-zinc-900">{eventType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Scheduled Date:</span>
                <span className="font-bold text-zinc-900">{targetDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Guest Count:</span>
                <span className="font-bold text-zinc-900">{guestCount} Guests</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Client Contact:</span>
                <span className="font-bold text-zinc-900">{fullName} ({phone})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-500">Budget Estimate:</span>
                <span className="font-bold text-amber-700">{budgetRange}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/food/menu"
                className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors"
              >
                Back to Food Menu
              </Link>
              <Link
                href="/food"
                className="px-6 py-3 rounded-full border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs transition-colors"
              >
                Return to Bistro Home
              </Link>
            </div>
          </div>
        ) : (
          /* Custom Order Form */
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
                <Cake className="w-3.5 h-3.5" />
                <span>Bespoke Pastry & Private Catering</span>
              </div>
              <h1 className="font-dropa text-3xl font-bold text-zinc-900">
                Request a Custom Culinary Order
              </h1>
              <p className="text-sm text-stone-500">
                Tell us about your celebration, headcount, and palate. Our chefs will draft an artisanal proposal within 3 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Type */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
                <h3 className="font-dropa text-base font-bold text-zinc-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                  <span>Select Order Category</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      type: "Celebration Cake" as const,
                      desc: "Handcrafted 2-3 tier cakes with custom floral or fondant styling.",
                    },
                    {
                      type: "Private Chef Dining" as const,
                      desc: "Exclusive 5-course in-home dining experience prepared live.",
                    },
                    {
                      type: "Corporate Executive Catering" as const,
                      desc: "Individually packaged gourmet bento boxes or buffet platters.",
                    },
                    {
                      type: "Wedding Reception" as const,
                      desc: "Full-scale firewood grill stations, small chops & dessert bar.",
                    },
                  ].map((cat) => (
                    <button
                      key={cat.type}
                      type="button"
                      onClick={() => setEventType(cat.type)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        eventType === cat.type
                          ? "border-amber-600 bg-amber-50/60 ring-2 ring-amber-600/20"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <span className="font-bold text-xs text-zinc-900 block mb-1">
                        {cat.type}
                      </span>
                      <span className="text-[11px] text-stone-500 leading-relaxed block">
                        {cat.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Logistics */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
                <h3 className="font-dropa text-base font-bold text-zinc-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span>Timeline & Headcount</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Event / Target Delivery Date
                    </label>
                    <input
                      type="date"
                      required
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Estimated Headcount
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Target Budget Range
                    </label>
                    <select
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="₦50,000 - ₦150,000">₦50,000 - ₦150,000</option>
                      <option value="₦150,000 - ₦400,000">₦150,000 - ₦400,000</option>
                      <option value="₦400,000 - ₦1,000,000">₦400,000 - ₦1,000,000</option>
                      <option value="₦1,000,000+">₦1,000,000+ (Luxury / Gala)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Theme / Flavor Profile Ideas
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Red velvet and salted caramel, rustic wooden grill setup..."
                    value={flavorTheme}
                    onChange={(e) => setFlavorTheme(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Client Details */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
                <h3 className="font-dropa text-base font-bold text-zinc-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                  <span>Contact Information & Special Dietary Requirements</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ngozi Adeleke"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      WhatsApp / Phone
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+234 800 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="client@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Special Dietary Requirements or Event Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about allergens, event venue address, schedule timing, or any specific culinary wishes..."
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Custom Culinary Brief</span>
              </button>
            </form>
          </div>
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
