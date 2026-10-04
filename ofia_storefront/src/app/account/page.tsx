"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  MapPin,
  Package,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  ChevronRight,
  Car,
  UtensilsCrossed,
  Shirt,
  Smartphone,
  HeartHandshake,
  Building2,
  Armchair,
} from "lucide-react";
import TemplateSwitcher from "@/components/common/TemplateSwitcher";
import StoreFooter from "@/components/common/StoreFooter";
import { MOCK_STORES } from "@/data/mockStores";

type AccountTab = "profile" | "addresses" | "orders" | "bookings";

interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  vertical: string;
  storeName: string;
  itemTitle: string;
  itemSubtitle?: string;
  total: number;
  status: "In Transit" | "Delivered" | "Processing" | "Preparing";
  trackingRef: string;
  image: string;
}

interface BookingItem {
  id: string;
  bookingRef: string;
  vertical: string;
  serviceTitle: string;
  storeName: string;
  date: string;
  timeSlot: string;
  location: string;
  status: "Confirmed" | "Completed" | "Pending";
  specialistOrHost?: string;
  actionLabel?: string;
}

interface AddressItem {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  isDefault: boolean;
}

const INITIAL_PROFILE = {
  fullName: "Oluwaseun Adeleke",
  email: "oluwaseun.adeleke@example.com",
  phone: "+234 803 456 7890",
  whatsappEnabled: true,
  city: "Lagos",
  membershipTier: "Patron Gold Tier",
  totalOrders: 14,
  activeBookings: 3,
};

const INITIAL_ADDRESSES: AddressItem[] = [
  {
    id: "addr-1",
    label: "Primary Residence",
    fullName: "Oluwaseun Adeleke",
    phone: "+234 803 456 7890",
    street: "14 Admiralty Way, Lekki Phase 1",
    city: "Lekki, Eti-Osa",
    state: "Lagos State",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Corporate Office",
    fullName: "Oluwaseun Adeleke",
    phone: "+234 803 456 7890",
    street: "Plot 8, Bishop Aboyade Cole Street",
    city: "Victoria Island",
    state: "Lagos State",
    isDefault: false,
  },
];

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: "ord-1",
    orderNumber: "OFIA-89421",
    date: "Today, 1:45 PM",
    vertical: "food",
    storeName: "Savory Republic",
    itemTitle: "Smoked Suya Glazed Short Ribs Feast",
    itemSubtitle: "Chef Special with Jollof Risotto & Fried Plantain",
    total: 38500,
    status: "In Transit",
    trackingRef: "OFIA-89421",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "ord-2",
    orderNumber: "OFIA-76120",
    date: "Yesterday, 4:20 PM",
    vertical: "fashion",
    storeName: "Aura & Loom",
    itemTitle: "Silk Lapel Agbada Three-Piece Ensemble",
    itemSubtitle: "Bespoke Cut in Midnight Obsidian (Size 42R)",
    total: 185000,
    status: "Processing",
    trackingRef: "OFIA-76120",
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "ord-3",
    orderNumber: "OFIA-65239",
    date: "Oct 1, 2024",
    vertical: "gadgets",
    storeName: "PulseTech",
    itemTitle: "Apple MacBook Pro 16\" M3 Max",
    itemSubtitle: "Space Black, 36GB Unified Memory, 1TB SSD",
    total: 3850000,
    status: "Delivered",
    trackingRef: "OFIA-65239",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "ord-4",
    orderNumber: "OFIA-53108",
    date: "Sep 28, 2024",
    vertical: "beauty",
    storeName: "LuxeGlow",
    itemTitle: "Botanical Illuminating Serum Duo",
    itemSubtitle: "Niacinamide 10% & Hibiscus Cold-Pressed Oil",
    total: 44000,
    status: "Delivered",
    trackingRef: "OFIA-53108",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80",
  },
];

const INITIAL_BOOKINGS: BookingItem[] = [
  {
    id: "bk-1",
    bookingRef: "BK-CARS-492",
    vertical: "cars",
    serviceTitle: "VIP Valet Test-Drive: 2024 Mercedes-AMG G63",
    storeName: "Apex Velocity",
    date: "Saturday, Oct 12, 2024",
    timeSlot: "11:00 AM - 12:30 PM",
    location: "Apex Showroom, Plot 14 Lekki Expressway, Lagos",
    status: "Confirmed",
    specialistOrHost: "Deji Adele (Master Concierge)",
  },
  {
    id: "bk-2",
    bookingRef: "BK-TAILOR-108",
    vertical: "fashion",
    serviceTitle: "Bespoke Anatomical Fitting & Measurement Session",
    storeName: "Aura & Loom",
    date: "Wednesday, Oct 16, 2024",
    timeSlot: "2:30 PM - 3:30 PM",
    location: "Aura Atelier, 7 Prince Alaba St, Lekki Phase 1",
    status: "Confirmed",
    specialistOrHost: "Folake Daniels (Head Patternmaker)",
  },
  {
    id: "bk-3",
    bookingRef: "BK-PROP-881",
    vertical: "property",
    serviceTitle: "Private Penthouse Viewing — The Sky Residence 18A",
    storeName: "Veloura Prime",
    date: "Friday, Oct 18, 2024",
    timeSlot: "4:00 PM - 5:00 PM",
    location: "Banana Island Waterfront Tower, Ikoyi, Lagos",
    status: "Confirmed",
    specialistOrHost: "Kelechi Okafor (Senior Asset Advisor)",
  },
  {
    id: "bk-4",
    bookingRef: "BK-SPA-302",
    vertical: "beauty",
    serviceTitle: "Deep Botanical Radiance Facial & Stress Relief",
    storeName: "LuxeGlow",
    date: "Sep 22, 2024",
    timeSlot: "1:00 PM - 2:30 PM",
    location: "Sanctuary Spa VI, 22 Saka Tinubu St, Victoria Island",
    status: "Completed",
    specialistOrHost: "Amara Nwosu (Lead Aesthetician)",
  },
];

export default function CustomerAccountPage() {
  const [activeTab, setActiveTab] = useState<AccountTab>("profile");
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  const [orders] = useState(INITIAL_ORDERS);
  const [bookings] = useState(INITIAL_BOOKINGS);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const getStatusBadge = (status: OrderItem["status"] | BookingItem["status"]) => {
    switch (status) {
      case "In Transit":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Delivered":
      case "Confirmed":
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Processing":
      case "Pending":
      case "Preparing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-stone-100 text-stone-800 border-stone-300";
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-zinc-900 flex flex-col font-sans">
      <TemplateSwitcher />

      {/* Account Hero Banner */}
      <section className="bg-[#111216] text-white border-b border-white/10 pt-10 pb-12">
        <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center border-2 border-white/20 shadow-xl shrink-0">
                OA
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-dropa text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                    {profile.fullName}
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {profile.membershipTier}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 flex items-center gap-3">
                  <span>{profile.email}</span>
                  <span>•</span>
                  <span>{profile.phone}</span>
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-3 sm:p-4 rounded-full">
              <div className="px-4 py-1 text-center border-r border-white/10">
                <span className="text-xl sm:text-2xl font-bold font-dropa block text-white">
                  {orders.length}
                </span>
                <span className="text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wider">
                  Total Orders
                </span>
              </div>
              <div className="px-4 py-1 text-center">
                <span className="text-xl sm:text-2xl font-bold font-dropa block text-emerald-400">
                  {bookings.filter((b) => b.status === "Confirmed").length}
                </span>
                <span className="text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wider">
                  Active Bookings
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-8 mt-4 border-t border-white/10">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "profile"
                  ? "bg-white text-zinc-900 shadow-md"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Customer Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "addresses"
                  ? "bg-white text-zinc-900 shadow-md"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Delivery Addresses ({addresses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "orders"
                  ? "bg-white text-zinc-900 shadow-md"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Order History ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "bookings"
                  ? "bg-white text-zinc-900 shadow-md"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Bookings & Appointments ({bookings.length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Tab Content */}
      <main className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 py-10 flex-1 w-full">
        {profileSaved && (
          <div className="mb-6 p-4 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile settings saved successfully to your Ofia customer account.</span>
          </div>
        )}

        {/* TAB 1: PROFILE */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <h2 className="font-dropa text-xl sm:text-2xl font-bold text-zinc-900">
                    Personal & Contact Profile
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                    Your verified details used for dispatch notifications and merchant bookings.
                  </p>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-zinc-900 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleProfileSave} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        className="w-full px-4 py-3 rounded-full border border-stone-200 focus:border-blue-600 focus:outline-none text-sm font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-full border border-stone-200 focus:border-blue-600 focus:outline-none text-sm font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                        Primary Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-full border border-stone-200 focus:border-blue-600 focus:outline-none text-sm font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                        Primary City / Territory
                      </label>
                      <input
                        type="text"
                        value={profile.city}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                        className="w-full px-4 py-3 rounded-full border border-stone-200 focus:border-blue-600 focus:outline-none text-sm font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-6 py-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60">
                    <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
                      Full Legal Name
                    </span>
                    <span className="text-sm font-bold text-zinc-900 mt-1 block">
                      {profile.fullName}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60">
                    <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
                      Contact Email
                    </span>
                    <span className="text-sm font-bold text-zinc-900 mt-1 block">
                      {profile.email}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60">
                    <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
                      Phone Number (WhatsApp Verified)
                    </span>
                    <span className="text-sm font-bold text-zinc-900 mt-1 block">
                      {profile.phone}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60">
                    <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
                      Primary Location
                    </span>
                    <span className="text-sm font-bold text-zinc-900 mt-1 block">
                      {profile.city}, Nigeria
                    </span>
                  </div>
                </div>
              )}

              {/* Notification Preferences */}
              <div className="pt-6 border-t border-stone-100 space-y-3">
                <h3 className="font-dropa text-base font-bold text-zinc-900">
                  Real-Time Notification Preferences
                </h3>
                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60 cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="text-xs sm:text-sm font-bold text-zinc-800 block">
                        Instant WhatsApp Dispatch Alerts
                      </span>
                      <span className="text-xs text-stone-500 block">
                        Receive live courier ETA, rider contact details, and OTP codes directly on WhatsApp.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 rounded-md accent-blue-600 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60 cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="text-xs sm:text-sm font-bold text-zinc-800 block">
                        SMS Calendar Reminders for Bookings
                      </span>
                      <span className="text-xs text-stone-500 block">
                        Receive SMS notifications 24 hours and 2 hours before scheduled test drives and fittings.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 rounded-md accent-blue-600 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Side Card: Ecosystem Status */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-dropa text-lg sm:text-xl font-bold">Ofia Verified Account</h3>
                  <p className="text-xs text-blue-200/80 mt-1 leading-relaxed">
                    Your single customer account works seamlessly across all 7 storefront templates, with instant escrow protection and verified merchant dispatch.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/order-tracking"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-blue-900 font-bold text-xs sm:text-sm hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    <span>Check Live Order Tracking</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Quick links to templates */}
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Explore Ofia Ecosystem Stores
                </h4>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/food"
                    className="flex items-center justify-between p-3 rounded-full hover:bg-stone-50 border border-stone-100 text-xs font-bold text-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                      <span>Savory Republic (Food & Bistro)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </Link>
                  <Link
                    href="/fashion"
                    className="flex items-center justify-between p-3 rounded-full hover:bg-stone-50 border border-stone-100 text-xs font-bold text-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Shirt className="w-4 h-4 text-amber-700" />
                      <span>Aura & Loom (Fashion Atelier)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </Link>
                  <Link
                    href="/cars"
                    className="flex items-center justify-between p-3 rounded-full hover:bg-stone-50 border border-stone-100 text-xs font-bold text-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-blue-600" />
                      <span>Apex Velocity (Dealership)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADDRESSES */}
        {activeTab === "addresses" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-dropa text-xl sm:text-2xl font-bold text-zinc-900">
                  Saved Delivery Addresses
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                  Manage your delivery destinations for instant one-click checkout across all stores.
                </p>
              </div>

              <button
                onClick={() => {
                  const newAddr: AddressItem = {
                    id: `addr-${Date.now()}`,
                    label: "Vacation / Guest House",
                    fullName: profile.fullName,
                    phone: profile.phone,
                    street: "Plot 12, Eko Atlantic City Boulevard",
                    city: "Victoria Island",
                    state: "Lagos State",
                    isDefault: false,
                  };
                  setAddresses([...addresses, newAddr]);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white rounded-3xl border p-6 sm:p-7 shadow-xs flex flex-col justify-between transition-all ${
                    addr.isDefault
                      ? "border-blue-600/80 ring-2 ring-blue-600/10"
                      : "border-stone-200/80"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-base text-zinc-900">{addr.label}</span>
                      </div>
                      {addr.isDefault && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                          Default Shipping
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs sm:text-sm text-stone-600 pt-1">
                      <p className="font-bold text-zinc-900">{addr.fullName}</p>
                      <p>{addr.street}</p>
                      <p>
                        {addr.city}, {addr.state}
                      </p>
                      <p className="text-stone-500 font-mono pt-1">📞 {addr.phone}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-stone-100 mt-4 flex items-center justify-between gap-3">
                    {!addr.isDefault ? (
                      <button
                        onClick={() =>
                          setAddresses(
                            addresses.map((a) => ({
                              ...a,
                              isDefault: a.id === addr.id,
                            }))
                          )
                        }
                        className="px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-xs font-bold text-zinc-800 transition-colors cursor-pointer"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active Default Address</span>
                      </span>
                    )}

                    <button
                      onClick={() => setAddresses(addresses.filter((a) => a.id !== addr.id))}
                      className="p-2.5 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-dropa text-xl sm:text-2xl font-bold text-zinc-900">
                  Order History & Dispatch Tracking
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                  Track real-time courier progress and review receipts across all your purchases.
                </p>
              </div>

              <Link
                href="/order-tracking"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
              >
                <Package className="w-4 h-4" />
                <span>Open Live Tracking Console</span>
              </Link>
            </div>

            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={ord.image}
                      alt={ord.itemTitle}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 border border-stone-100"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-blue-600">
                          #{ord.orderNumber}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="text-xs font-bold text-zinc-600">{ord.storeName}</span>
                        <span className="text-stone-300">•</span>
                        <span className="text-xs text-stone-400">{ord.date}</span>
                      </div>

                      <h3 className="font-dropa text-base sm:text-lg font-bold text-zinc-900">
                        {ord.itemTitle}
                      </h3>

                      {ord.itemSubtitle && (
                        <p className="text-xs text-stone-500 line-clamp-1">{ord.itemSubtitle}</p>
                      )}

                      <div className="pt-1 flex items-center gap-3">
                        <span className="text-sm sm:text-base font-bold text-zinc-900">
                          ₦{ord.total.toLocaleString()}
                        </span>
                        <span
                          className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                            ord.status
                          )}`}
                        >
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Single clear button per order card */}
                  <div className="w-full md:w-auto flex md:justify-end shrink-0">
                    <Link
                      href={`/order-tracking?ref=${ord.trackingRef}`}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      <span>Track Order</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-dropa text-xl sm:text-2xl font-bold text-zinc-900">
                  Bookings, Test-Drives & Appointments
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                  Your upcoming showroom visits, bespoke fittings, and spa treatments.
                </p>
              </div>

              <Link
                href="/templates"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Book a New Experience</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map((bk) => (
                <div
                  key={bk.id}
                  className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between transition-all hover:shadow-md"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-600">
                        #{bk.bookingRef}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                          bk.status
                        )}`}
                      >
                        {bk.status}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                        {bk.storeName}
                      </span>
                      <h3 className="font-dropa text-lg sm:text-xl font-bold text-zinc-900 mt-0.5">
                        {bk.serviceTitle}
                      </h3>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-2 text-xs sm:text-sm text-stone-700">
                      <div className="flex items-center gap-2 font-medium">
                        <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                          {bk.date} • {bk.timeSlot}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-medium">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="line-clamp-1">{bk.location}</span>
                      </div>
                      {bk.specialistOrHost && (
                        <div className="flex items-center gap-2 text-stone-500 pt-1 border-t border-stone-200/50">
                          <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>Host: {bk.specialistOrHost}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Single clear button per booking card */}
                  <div className="pt-6 border-t border-stone-100 mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs text-stone-500">
                      Showroom confirmed via SMS & WhatsApp
                    </span>

                    <button
                      type="button"
                      onClick={() => alert(`Viewing booking details for ${bk.bookingRef}`)}
                      className="px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <StoreFooter store={MOCK_STORES.fashion} />
    </div>
  );
}
