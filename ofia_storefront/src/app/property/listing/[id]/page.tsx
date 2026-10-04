"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Building2,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  Share2,
  Phone,
  MessageSquare,
  Sparkles,
  Send,
  Check,
  Eye,
} from "lucide-react";

export default function PropertyDetailPage() {
  const params = useParams();
  const store = MOCK_STORES.property;

  const propertyId = (params?.id as string) || "prp-001";
  const property =
    MOCK_PRODUCTS.find((p) => p.id === propertyId && p.vertical === "property") ||
    MOCK_PRODUCTS.find((p) => p.vertical === "property") ||
    MOCK_PRODUCTS[0];

  const meta = property.propertyMeta;
  const [selectedImage, setSelectedImage] = useState(0);

  // Inquiry form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [leaseDuration, setLeaseDuration] = useState("1 Year");
  const [message, setMessage] = useState(
    `Hello, I would like to inquire about the lease terms for ${property.title}.`
  );
  const [inquirySent, setInquirySent] = useState(false);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    setInquirySent(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111318] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* Navigation & Share */}
        <div className="flex items-center justify-between">
          <Link
            href="/property/listings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Residences</span>
          </Link>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: property.title,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Property URL copied to clipboard");
              }
            }}
            className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Share Residence"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Top Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Gallery Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-16/10 rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md">
              <img
                src={property.images[selectedImage] || property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/90 text-white backdrop-blur-xs border border-white/10">
                  {meta?.propertyType || "Apartment"}
                </span>
                {meta?.furnished && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                    {meta.furnished}
                  </span>
                )}
              </div>
              {meta?.location && (
                <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-slate-900/80 text-white flex items-center gap-1.5 backdrop-blur-xs">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>{meta.location}</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {property.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-16/10 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? "border-blue-600 ring-2 ring-blue-600/20"
                        : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${property.title} preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Property Description */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-dropa text-lg font-bold text-slate-900">
                Architectural Statement & Neighborhood
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                {property.description}
              </p>

              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Building Highlights & Security
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {property.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing, Actions & Inquiry Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Title & Rent Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {meta?.location}
                </span>
                <h1 className="font-dropa text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {property.title}
                </h1>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                    {meta?.rentalTerms || "Annual Lease Rate"}
                  </span>
                  <span className="font-dropa text-2xl sm:text-3xl font-bold text-slate-900">
                    {store.currency}{property.price.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Available {meta?.availableFrom || "Immediately"}
                  </span>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-2.5">
                <Link
                  href={`/property/schedule-viewing/${property.id}`}
                  className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Private Viewing Tour</span>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/${store.contact.whatsapp?.replace(/[^0-9]/g, "")}?text=Hi,%20I%20am%20inquiring%20about%20the%20${encodeURIComponent(property.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Concierge</span>
                  </a>
                  <a
                    href={`tel:${store.contact.phone}`}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Desk</span>
                  </a>
                </div>
              </div>

              {/* Architectural Specs Grid */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bedrooms</span>
                  <span className="font-bold text-slate-800">{meta?.bedrooms} Suites</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bathrooms</span>
                  <span className="font-bold text-slate-800">{meta?.bathrooms} Full</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Floor Area</span>
                  <span className="font-bold text-slate-800">{meta?.squareFeet} sqft</span>
                </div>
              </div>
            </div>

            {/* Direct Inquiry Form Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-dropa text-base font-bold text-slate-900">
                Direct Landlord & Agent Inquiry
              </h3>

              {inquirySent ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Inquiry Sent to Managing Broker!</span>
                  </div>
                  <p className="text-emerald-800">
                    Our lead leasing agent will contact you shortly with the official floor plans and lease agreement schedule.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Folake Solanke"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+234 800 000 0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Target Lease
                      </label>
                      <select
                        value={leaseDuration}
                        onChange={(e) => setLeaseDuration(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="Short-Let (1-4 Weeks)">Short-Let (1-4 Weeks)</option>
                        <option value="6 Months Executive">6 Months Executive</option>
                        <option value="1 Year Renewable">1 Year Renewable</option>
                        <option value="Multi-Year Lease">Multi-Year Lease</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Inquiry Notes
                    </label>
                    <textarea
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Lease Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Complete Amenities & Facility Grid */}
        {meta?.amenities && (
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3 className="font-dropa text-xl font-bold text-slate-900">
                Verified Amenities & Community Infrastructure
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {meta.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs font-semibold text-slate-800"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
