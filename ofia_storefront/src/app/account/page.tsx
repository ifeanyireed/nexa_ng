"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  User,
  MapPin,
  Package,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  LogOut,
  LogIn,
  Search,
  Check,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Store,
  Shirt,
  Scissors,
} from "lucide-react";
import TemplateSwitcher from "@/components/common/TemplateSwitcher";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import { useStorefrontTenant } from "@/context/StorefrontTenantContext";
import { useBuyerAuth, BuyerAddress } from "@/context/BuyerAuthContext";
import { MOCK_STORES } from "@/data/mockStores";
import { StorefrontOrderPayload, StorefrontBookingPayload } from "@/types/storefront";

type AccountTab = "profile" | "addresses" | "orders" | "bookings";

function AccountPageInner() {
  const searchParams = useSearchParams();
  const { tenantSlug, store: dynamicStore, handshake } = useStorefrontTenant();
  const store = dynamicStore || MOCK_STORES.fashion;
  const config = handshake?.storefrontConfig;

  const {
    buyer,
    isAuthenticated,
    isLoading: isAuthLoading,
    login,
    register,
    logout,
    updateProfile,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
  } = useBuyerAuth();

  const [activeTab, setActiveTab] = useState<AccountTab>("profile");

  // Auth Card Form States (when unauthenticated)
  const [authMode, setAuthMode] = useState<"signin" | "register" | "lookup">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authCity, setAuthCity] = useState("Lagos");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [lookupRef, setLookupRef] = useState("");

  // Authenticated Profile Form States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileCity, setProfileCity] = useState("Lagos");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Address Modal/Form State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState("Primary Residence");
  const [newAddrStreet, setNewAddrStreet] = useState("");
  const [newAddrCity, setNewAddrCity] = useState("Lagos");
  const [newAddrState, setNewAddrState] = useState("Lagos State");
  const [newAddrPhone, setNewAddrPhone] = useState("");
  const [newAddrIsDefault, setNewAddrIsDefault] = useState(false);

  // Live Orders & Bookings from DB/API
  const [orders, setOrders] = useState<StorefrontOrderPayload[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [bookings, setBookings] = useState<StorefrontBookingPayload[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Sync profile form states when buyer profile changes
  useEffect(() => {
    if (buyer) {
      setProfileName(buyer.fullName || "");
      setProfileEmail(buyer.email || "");
      setProfilePhone(buyer.phone || "");
      setProfileCity(buyer.city || "Lagos");
      setNewAddrPhone(buyer.phone || "");
    }
  }, [buyer]);

  // Fetch real customer orders from Neon/Lakebase
  const fetchCustomerOrders = useCallback(async () => {
    if (!buyer || (!buyer.email && !buyer.phone)) {
      setOrders([]);
      return;
    }

    setIsLoadingOrders(true);
    setOrdersError(null);
    try {
      const activeTenant = tenantSlug || "fashion";
      const queryParams = new URLSearchParams({
        tenant: activeTenant,
      });
      if (buyer.email) queryParams.set("email", buyer.email);
      if (buyer.phone) queryParams.set("phone", buyer.phone);

      const res = await fetch(`/api/storefront/orders?${queryParams.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.warn("[Account Orders] Fetch warning:", err);
      setOrdersError("Could not refresh live order history.");
    } finally {
      setIsLoadingOrders(false);
    }
  }, [buyer, tenantSlug]);

  // Fetch real customer bookings
  const fetchCustomerBookings = useCallback(async () => {
    if (!buyer || (!buyer.email && !buyer.phone)) {
      setBookings([]);
      return;
    }

    setIsLoadingBookings(true);
    try {
      const activeTenant = tenantSlug || "fashion";
      const queryParams = new URLSearchParams({
        tenant: activeTenant,
      });
      if (buyer.email) queryParams.set("email", buyer.email);
      if (buyer.phone) queryParams.set("phone", buyer.phone);

      const res = await fetch(`/api/storefront/bookings?${queryParams.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.warn("[Account Bookings] Fetch warning:", err);
    } finally {
      setIsLoadingBookings(false);
    }
  }, [buyer, tenantSlug]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomerOrders();
      fetchCustomerBookings();
    }
  }, [isAuthenticated, fetchCustomerOrders, fetchCustomerBookings]);

  // Handle Sign In / Register
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmittingAuth(true);

    try {
      if (authMode === "signin") {
        const res = await login({
          email: authEmail,
          phone: authPhone,
        });
        if (!res.success) {
          setAuthError(res.error || "Unable to sign in. Please verify your email or phone.");
        }
      } else if (authMode === "register") {
        const res = await register({
          fullName: authFullName,
          email: authEmail,
          phone: authPhone,
          city: authCity,
        });
        if (!res.success) {
          setAuthError(res.error || "Unable to register account. Please check your information.");
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Handle Profile Save
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateProfile({
      fullName: profileName,
      email: profileEmail,
      phone: profilePhone,
      city: profileCity,
    });
    if (ok) {
      setIsEditingProfile(false);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
  };

  // Handle Add Address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet.trim()) return;

    await saveAddress({
      label: newAddrLabel || "Primary Residence",
      fullName: buyer?.fullName || profileName || "Customer",
      phone: newAddrPhone || buyer?.phone || profilePhone || "",
      street: newAddrStreet.trim(),
      city: newAddrCity || "Lagos",
      state: newAddrState || "Lagos State",
      isDefault: newAddrIsDefault || (buyer?.addresses.length === 0),
    });

    setIsAddingAddress(false);
    setNewAddrStreet("");
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "DISPATCHED":
      case "IN_TRANSIT":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "IN_PREPARATION":
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-stone-100 text-stone-800 border-stone-300";
    }
  };

  const buyerInitials = buyer?.fullName
    ? buyer.fullName
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "OA";

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans">
      <TemplateSwitcher />
      <StoreHeader store={store} />

      {/* Main Account View */}
      {isAuthLoading ? (
        <div className="flex-1 flex items-center justify-center py-24 text-stone-400 text-xs font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600" />
          <span>Synchronizing customer session...</span>
        </div>
      ) : !isAuthenticated || !buyer ? (
        /* ================= UNAUTHENTICATED STATE ================= */
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden">
            {/* Top Header */}
            <div className="bg-stone-900 text-white p-6 sm:p-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
                <User className="w-6 h-6" />
              </div>
              <h1 className="font-dropa text-2xl sm:text-3xl font-bold">
                Customer Account & Order Portal
              </h1>
              <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto">
                Sign in to view your real-time courier dispatches, manage saved delivery addresses, and review order receipts.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="border-b border-stone-200 bg-stone-50/80 p-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setAuthError(null);
                }}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  authMode === "signin"
                    ? "bg-white text-blue-700 shadow-xs border border-stone-200"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setAuthError(null);
                }}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  authMode === "register"
                    ? "bg-white text-blue-700 shadow-xs border border-stone-200"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("lookup");
                  setAuthError(null);
                }}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  authMode === "lookup"
                    ? "bg-white text-blue-700 shadow-xs border border-stone-200"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Direct Order Lookup
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 sm:p-10">
              {authError && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authMode === "lookup" ? (
                /* Mode 3: Direct Order Lookup without login */
                <div className="space-y-4 max-w-md mx-auto text-center">
                  <p className="text-xs text-stone-600">
                    Enter the order reference from your SMS or WhatsApp receipt (e.g. <span className="font-mono font-bold text-stone-900">OFIA-2026-4821</span>) to access instant live GPS dispatch tracking.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. OFIA-2026-4821"
                      value={lookupRef}
                      onChange={(e) => setLookupRef(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-3 rounded-full border border-stone-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                    />
                    <Link
                      href={`/order-tracking?ref=${encodeURIComponent(lookupRef.trim())}${tenantSlug ? `&tenant=${encodeURIComponent(tenantSlug)}` : ""}`}
                      className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Search className="w-4 h-4" />
                      <span>Track</span>
                    </Link>
                  </div>
                </div>
              ) : (
                /* Modes 1 & 2: Sign In / Create Account */
                <form onSubmit={handleAuthSubmit} className="space-y-4 max-w-md mx-auto">
                  {authMode === "register" && (
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Babatunde Adeleke"
                        value={authFullName}
                        onChange={(e) => setAuthFullName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-full border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="buyer@domain.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-full border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Phone Number (WhatsApp Dispatch)
                    </label>
                    <input
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-full border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {authMode === "register" && (
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Delivery City / State
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Lagos, Abuja, Port Harcourt"
                        value={authCity}
                        onChange={(e) => setAuthCity(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-full border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className="w-full py-3.5 px-6 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-stone-300 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mt-4"
                  >
                    {isSubmittingAuth ? (
                      <span>Verifying Session...</span>
                    ) : authMode === "signin" ? (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In & Access Account</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Create Customer Account</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
      ) : (
        /* ================= AUTHENTICATED STATE ================= */
        <>
          {/* Account Hero Banner */}
          <section className="bg-white text-zinc-900 border-b border-zinc-200/80 pt-8 pb-10">
            <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center border-2 border-white shadow-md shrink-0">
                    {buyerInitials}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="font-dropa text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-950">
                        {buyer.fullName}
                      </h1>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                        {buyer.membershipTier || "Verified Patron"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-500 flex items-center gap-3">
                      <span>{buyer.email || "No email on file"}</span>
                      <span>•</span>
                      <span>{buyer.phone || "No phone on file"}</span>
                    </p>
                  </div>
                </div>

                {/* Quick Metrics & Logout Action */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4 bg-stone-50 border border-zinc-200 p-3 sm:p-4 rounded-full shadow-2xs">
                    <div className="px-4 py-1 text-center border-r border-zinc-200">
                      <span className="text-xl sm:text-2xl font-bold font-dropa block text-zinc-950">
                        {orders.length}
                      </span>
                      <span className="text-[10px] sm:text-xs text-stone-500 uppercase tracking-wider font-medium">
                        Total Orders
                      </span>
                    </div>
                    <div className="px-4 py-1 text-center">
                      <span className="text-xl sm:text-2xl font-bold font-dropa block text-emerald-600">
                        {bookings.filter((b) => b.status === "CONFIRMED" || (b.status as any) === "Confirmed").length}
                      </span>
                      <span className="text-[10px] sm:text-xs text-stone-500 uppercase tracking-wider font-medium">
                        Bookings
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={logout}
                    title="Sign Out"
                    className="p-3.5 rounded-full border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs Pill Bar */}
              <div className="pt-6 mt-6 border-t border-zinc-200/80">
                <div className="inline-flex items-center gap-1 bg-stone-100/90 border border-stone-200/80 p-1.5 rounded-full overflow-x-auto max-w-full">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex items-center gap-2 px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === "profile"
                        ? "bg-white text-zinc-950 shadow-xs font-bold"
                        : "text-stone-600 hover:text-zinc-950 hover:bg-white/60"
                    }`}
                  >
                    <User className="w-4 h-4 text-stone-500" />
                    <span>Customer Profile</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("addresses")}
                    className={`flex items-center gap-2 px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === "addresses"
                        ? "bg-white text-zinc-950 shadow-xs font-bold"
                        : "text-stone-600 hover:text-zinc-950 hover:bg-white/60"
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-stone-500" />
                    <span>Saved Addresses ({buyer.addresses.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("orders");
                      fetchCustomerOrders();
                    }}
                    className={`flex items-center gap-2 px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === "orders"
                        ? "bg-white text-zinc-950 shadow-xs font-bold"
                        : "text-stone-600 hover:text-zinc-950 hover:bg-white/60"
                    }`}
                  >
                    <Package className="w-4 h-4 text-stone-500" />
                    <span>Live Orders ({orders.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("bookings");
                      fetchCustomerBookings();
                    }}
                    className={`flex items-center gap-2 px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === "bookings"
                        ? "bg-white text-zinc-950 shadow-xs font-bold"
                        : "text-stone-600 hover:text-zinc-950 hover:bg-white/60"
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-stone-500" />
                    <span>Bookings ({bookings.length})</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Main Tab Content */}
          <main className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 py-10 flex-1 w-full">
            {profileSuccess && (
              <div className="mb-6 p-4 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile settings saved and synced successfully to your customer session.</span>
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
                        Your verified details used for automatic checkout pre-filling and dispatch alerts.
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
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
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
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-full border border-stone-200 focus:border-blue-600 focus:outline-none text-sm font-medium"
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
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="w-full px-4 py-3 rounded-full border border-stone-200 focus:border-blue-600 focus:outline-none text-sm font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                            Primary City
                          </label>
                          <input
                            type="text"
                            value={profileCity}
                            onChange={(e) => setProfileCity(e.target.value)}
                            className="w-full px-4 py-3 rounded-full border border-stone-200 focus:border-blue-600 focus:outline-none text-sm font-medium"
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex items-center gap-3">
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-6 py-2.5 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-bold cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                      <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/60">
                        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                          Full Legal Name
                        </span>
                        <span className="font-bold text-zinc-900 text-base">{buyer.fullName}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/60">
                        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                          Email Address
                        </span>
                        <span className="font-semibold text-zinc-900">{buyer.email || "None provided"}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/60">
                        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                          Phone Number
                        </span>
                        <span className="font-semibold text-zinc-900">{buyer.phone || "None provided"}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/60">
                        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                          City / Territory
                        </span>
                        <span className="font-semibold text-zinc-900">{buyer.city || "Lagos, Nigeria"}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Side Card: Ecosystem Status */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <h3 className="font-dropa text-lg sm:text-xl font-bold">Ofia Authenticated Customer</h3>
                      <p className="text-xs text-blue-200/80 mt-1 leading-relaxed">
                        Your account saves your shipping addresses and keeps an active audit trail of your purchases across all Ofia storefronts with guaranteed escrow security.
                      </p>
                    </div>
                    <div className="pt-2">
                      <Link
                        href={`/fashion/catalog${tenantSlug ? `?tenant=${tenantSlug}` : ""}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-blue-900 font-bold text-xs sm:text-sm hover:bg-blue-50 transition-colors shadow-sm"
                      >
                        <span>Browse Catalog</span>
                        <ArrowRight className="w-4 h-4" />
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
                      Your saved shipping destinations are automatically pre-filled during checkout.
                    </p>
                  </div>

                  {!isAddingAddress && (
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Address</span>
                    </button>
                  )}
                </div>

                {/* Add Address Form Modal/Box */}
                {isAddingAddress && (
                  <form
                    onSubmit={handleAddAddress}
                    className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-4 max-w-xl animate-in fade-in"
                  >
                    <h3 className="font-dropa text-base font-bold text-zinc-900">New Destination Address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Address Label</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Home, Office, Beach House"
                          value={newAddrLabel}
                          onChange={(e) => setNewAddrLabel(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={newAddrPhone}
                          onChange={(e) => setNewAddrPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-stone-700 mb-1">Street Address</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 14 Admiralty Way, Block B4, Lekki Phase 1"
                          value={newAddrStreet}
                          onChange={(e) => setNewAddrStreet(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={newAddrCity}
                          onChange={(e) => setNewAddrCity(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">State</label>
                        <input
                          type="text"
                          required
                          value={newAddrState}
                          onChange={(e) => setNewAddrState(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="defaultAddrCheck"
                        checked={newAddrIsDefault}
                        onChange={(e) => setNewAddrIsDefault(e.target.checked)}
                        className="rounded accent-blue-600"
                      />
                      <label htmlFor="defaultAddrCheck" className="text-xs text-stone-700 font-semibold cursor-pointer">
                        Set as primary default address
                      </label>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-700 font-bold text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {buyer.addresses.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-stone-50 border border-stone-200 text-stone-400 space-y-2">
                    <MapPin className="w-8 h-8 mx-auto text-stone-300" />
                    <p className="font-semibold text-stone-700">No saved addresses yet</p>
                    <p className="text-xs text-stone-500">
                      When you check out or add an address above, it will be saved here for one-click ordering.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {buyer.addresses.map((addr: BuyerAddress) => (
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
                              onClick={() => setDefaultAddress(addr.id)}
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
                            onClick={() => deleteAddress(addr.id)}
                            className="p-2.5 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Remove address"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: LIVE ORDERS */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-dropa text-xl sm:text-2xl font-bold text-zinc-900">
                      Live Order History & Telemetry
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                      Real purchases synchronized with Neon PostgreSQL and live GPS courier tracking.
                    </p>
                  </div>

                  <button
                    onClick={fetchCustomerOrders}
                    disabled={isLoadingOrders}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-700 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? "animate-spin text-blue-600" : ""}`} />
                    <span>Refresh Orders</span>
                  </button>
                </div>

                {isLoadingOrders ? (
                  <div className="p-12 text-center text-stone-400 text-xs font-semibold">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Loading verified order history from database...</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-stone-50 border border-stone-200 text-stone-500 space-y-3">
                    <Package className="w-10 h-10 text-stone-300 mx-auto" />
                    <h3 className="font-dropa text-base font-bold text-zinc-800">No Orders Found Yet</h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Orders placed using this account email ({buyer.email}) or phone ({buyer.phone}) will automatically appear here.
                    </p>
                    <div className="pt-2">
                      <Link
                        href={`/fashion/catalog${tenantSlug ? `?tenant=${tenantSlug}` : ""}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
                      >
                        <Store className="w-4 h-4" />
                        <span>Explore Fashion Catalog</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-100 border border-stone-200/80 overflow-hidden flex items-center justify-center shrink-0">
                            {ord.items && ord.items[0]?.image ? (
                              <img
                                src={ord.items[0].image}
                                alt="Item"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-stone-400" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-blue-600">
                                #{ord.orderNumber}
                              </span>
                              <span className="text-stone-300">•</span>
                              <span className="text-xs font-bold text-zinc-600">
                                {ord.tenantSlug.toUpperCase()}
                              </span>
                              <span className="text-stone-300">•</span>
                              <span className="text-xs text-stone-400">{ord.createdAt}</span>
                            </div>

                            <h3 className="font-dropa text-base sm:text-lg font-bold text-zinc-900 line-clamp-1">
                              {ord.itemsSummary || "Storefront Order"}
                            </h3>

                            <p className="text-xs text-stone-500">
                              Destination: {ord.shippingAddress}, {ord.city}
                            </p>

                            <div className="pt-1 flex items-center gap-3">
                              <span className="text-sm sm:text-base font-bold text-zinc-900">
                                {ord.totalAmount}
                              </span>
                              <span
                                className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getOrderStatusBadge(
                                  ord.status
                                )}`}
                              >
                                {ord.status}
                              </span>
                              {ord.isEscrow && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  Escrow Vault Protected
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="w-full md:w-auto flex md:justify-end shrink-0">
                          <Link
                            href={`/order-tracking?ref=${encodeURIComponent(ord.orderNumber)}${tenantSlug ? `&tenant=${encodeURIComponent(tenantSlug)}` : ""}`}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                          >
                            <Package className="w-4 h-4" />
                            <span>Track Order</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: BOOKINGS */}
            {activeTab === "bookings" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-dropa text-xl sm:text-2xl font-bold text-zinc-900">
                      Bookings, Fittings & Appointments
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                      Your upcoming bespoke tailor sessions, test-drives, and showroom appointments.
                    </p>
                  </div>

                  <Link
                    href={`/fashion/custom-tailoring${tenantSlug ? `?tenant=${tenantSlug}` : ""}`}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Book Bespoke Fitting</span>
                  </Link>
                </div>

                {isLoadingBookings ? (
                  <div className="p-12 text-center text-stone-400 text-xs font-semibold">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Loading bookings...</span>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-stone-50 border border-stone-200 text-stone-500 space-y-3">
                    <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
                    <h3 className="font-dropa text-base font-bold text-zinc-800">No Appointments Booked Yet</h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Schedule a custom measurement session or atelier fitting and view it here anytime.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bookings.map((bk) => (
                      <div
                        key={bk.id}
                        className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between transition-all hover:shadow-md"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-blue-600">
                              #{bk.bookingNumber}
                            </span>
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {bk.status}
                            </span>
                          </div>

                          <div>
                            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                              {bk.tenantSlug.toUpperCase()} ATELIER
                            </span>
                            <h3 className="font-dropa text-lg sm:text-xl font-bold text-zinc-900 mt-0.5">
                              {bk.serviceTitle}
                            </h3>
                          </div>

                          <div className="p-4 rounded-2xl bg-stone-50 space-y-1.5 text-xs text-stone-700">
                            <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span>{bk.dateTime}</span>
                            </p>
                            {bk.technicianName && (
                              <p className="text-stone-500">Master Tailor: {bk.technicianName}</p>
                            )}
                            {bk.notes && <p className="text-stone-500 italic">"{bk.notes}"</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </>
      )}

      <StoreFooter store={store} />
    </div>
  );
}

export default function CustomerAccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-xs text-stone-400">Loading account...</div>}>
      <AccountPageInner />
    </Suspense>
  );
}
