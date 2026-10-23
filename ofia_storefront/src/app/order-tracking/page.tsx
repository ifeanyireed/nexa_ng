"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Store,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Search,
  MessageCircle,
  CreditCard,
  Building,
  Check,
  Compass,
  Radio,
  Navigation,
} from "lucide-react";
import { useStorefrontTenant } from "@/context/StorefrontTenantContext";
import { StorefrontOrderPayload } from "@/types/storefront";

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { tenantSlug: contextSlug, store, handshake } = useStorefrontTenant();

  const urlRef = searchParams.get("ref") || searchParams.get("orderNumber") || searchParams.get("id");
  const tenantParam = searchParams.get("tenant") || contextSlug || "";
  const initialRef = urlRef || "";

  const [trackingNumber, setTrackingNumber] = useState(initialRef);
  const [searchInput, setSearchInput] = useState(initialRef);
  const [order, setOrder] = useState<StorefrontOrderPayload | null>(null);
  const [dispatchInfo, setDispatchInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Return navigation details
  const activeTenantSlug = order?.tenantSlug || tenantParam || "";
  const returnHref = activeTenantSlug ? `/?tenant=${encodeURIComponent(activeTenantSlug)}` : "/";
  const storeDisplayName =
    store?.name || handshake?.storefrontConfig?.storeName || (activeTenantSlug ? activeTenantSlug.toUpperCase() : "Storefront");

  // Fetch live order details & dispatch telemetry from Lakebase PostgreSQL
  const fetchOrderDetails = useCallback(
    async (refToFetch: string, isAutoRefresh = false) => {
      if (!refToFetch) return;

      if (!activeTenantSlug) {
        setError("Missing tenant context. Please provide a tenant parameter (?tenant=) to track this order.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isAutoRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const queryUrl = `/api/storefront/orders?ref=${encodeURIComponent(refToFetch.trim())}${
          activeTenantSlug ? `&tenant=${encodeURIComponent(activeTenantSlug)}` : ""
        }`;

        const res = await fetch(queryUrl, { cache: "no-store" });
        const data = await res.json();

        if (res.ok && data.success && data.order) {
          setOrder(data.order);
          setError(null);
          setLastChecked(new Date());
          setSecondsAgo(0);

          // Concurrently fetch dynamic GPS dispatch telemetry for active tenant
          const effTenant = data.order.tenantSlug || activeTenantSlug;
          if (effTenant) {
            try {
              const dispatchRes = await fetch(
                `/api/storefront/dispatch?ref=${encodeURIComponent(refToFetch.trim())}&tenant=${encodeURIComponent(effTenant)}`,
                { cache: "no-store" }
              );
              if (dispatchRes.ok) {
                const dispatchData = await dispatchRes.json();
                if (dispatchData.success && dispatchData.logistics) {
                  setDispatchInfo(dispatchData.logistics);
                }
              }
            } catch (dErr) {
              console.warn("[Telemetry] Non-fatal dispatch fetch notice:", dErr);
            }
          }
        } else {
          // Direct dispatch shipment lookup fallback
          try {
            const dispatchRes = await fetch(
              `/api/storefront/dispatch?ref=${encodeURIComponent(refToFetch.trim())}&tenant=${encodeURIComponent(activeTenantSlug)}`,
              { cache: "no-store" }
            );
            if (dispatchRes.ok) {
              const dispatchData = await dispatchRes.json();
              if (dispatchData.success) {
                const sOrder: StorefrontOrderPayload = {
                  id: dispatchData.trackingNumber || refToFetch,
                  orderNumber: dispatchData.orderNumber || refToFetch,
                  tenantSlug: dispatchData.tenantSlug || activeTenantSlug,
                  customerName: dispatchData.logistics?.telemetry?.destination?.name || "Recipient",
                  customerPhone: "",
                  channel: "STOREFRONT",
                  shippingAddress: dispatchData.logistics?.telemetry?.destination?.address || "Lagos",
                  city: dispatchData.logistics?.telemetry?.destination?.city || "Lagos",
                  paymentMethod: "card",
                  items: [
                    {
                      id: "dp-1",
                      name: dispatchData.parcel?.category || "Express Courier Parcel",
                      quantity: 1,
                      price: dispatchData.parcel?.shippingFee || 2500,
                    },
                  ],
                  itemsSummary:
                    dispatchData.parcel?.description ||
                    dispatchData.parcel?.category ||
                    "Express Courier Parcel",
                  itemCount: 1,
                  totalAmount: `₦${Number(dispatchData.parcel?.shippingFee || 2500).toLocaleString()}`,
                  rawAmount: Number(dispatchData.parcel?.shippingFee || 2500),
                  status:
                    dispatchData.orderStatus === "PENDING"
                      ? "IN_PREPARATION"
                      : dispatchData.orderStatus === "DELIVERED"
                      ? "DELIVERED"
                      : "READY_DISPATCH",
                  paymentStatus: "PAID",
                  deliveryMethod: "DISPATCH",
                  createdAt: "Recently",
                  notes: `Delivery OTP: ${dispatchData.deliveryOtp || "Verified"}`,
                };

                setOrder(sOrder);
                if (dispatchData.logistics) {
                  setDispatchInfo(dispatchData.logistics);
                }
                setError(null);
                setLastChecked(new Date());
                setSecondsAgo(0);
                return;
              }
            }
          } catch {}

          setError(data.error || `No active dispatch found for reference "${refToFetch}"`);
          if (!isAutoRefresh) {
            setOrder(null);
            setDispatchInfo(null);
          }
        }
      } catch (err: any) {
        if (!isAutoRefresh) {
          setError("Failed to connect to live logistics gateway: " + err.message);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTenantSlug]
  );

  // Initial fetch on mount or when URL ref changes
  useEffect(() => {
    if (initialRef) {
      setTrackingNumber(initialRef);
      setSearchInput(initialRef);
      fetchOrderDetails(initialRef, false);
    }
  }, [initialRef, fetchOrderDetails]);

  // Auto-refresh polling every 10 seconds (Live Real-Time Stepper sync with ERP)
  useEffect(() => {
    if (!trackingNumber) return;

    const intervalId = setInterval(() => {
      fetchOrderDetails(trackingNumber, true);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [trackingNumber, fetchOrderDetails]);

  // Elapsed seconds timer for live indicator
  useEffect(() => {
    const timer = setInterval(() => {
      if (lastChecked) {
        const elapsed = Math.floor((Date.now() - lastChecked.getTime()) / 1000);
        setSecondsAgo(elapsed);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastChecked]);

  // Handle manual tracking search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const clean = searchInput.trim();
    setTrackingNumber(clean);
    const params = new URLSearchParams(window.location.search);
    params.set("ref", clean);
    if (activeTenantSlug) params.set("tenant", activeTenantSlug);
    router.replace(`/order-tracking?${params.toString()}`);
    fetchOrderDetails(clean, false);
  };

  // Quick prefill pill helper
  const handlePrefill = (ref: string) => {
    setSearchInput(ref);
    setTrackingNumber(ref);
    const params = new URLSearchParams(window.location.search);
    params.set("ref", ref);
    if (activeTenantSlug) params.set("tenant", activeTenantSlug);
    router.replace(`/order-tracking?${params.toString()}`);
    fetchOrderDetails(ref, false);
  };

  // Build dynamic milestone steps according to real-time order.status
  const currentStatus = order?.status || "IN_PREPARATION";

  const isStep1Done = true; // Escrow confirmed upon order entry
  const isStep2Done = currentStatus === "READY_DISPATCH" || currentStatus === "DELIVERED";
  const isStep2Active = currentStatus === "IN_PREPARATION" || currentStatus === "PENDING" || currentStatus === "CONFIRMED";
  const isStep3Done = currentStatus === "DELIVERED";
  const isStep3Active = currentStatus === "READY_DISPATCH";
  const isStep4Done = currentStatus === "DELIVERED";

  const steps = [
    {
      title: "Order Received & Escrow Secured",
      time: order?.createdAt || "Verified",
      desc: "Merchant received order. Payment held securely in Ofia Escrow Vault.",
      completed: isStep1Done,
      current: false,
    },
    {
      title: "Merchant Atelier Preparation",
      time: isStep2Done ? "Completed" : isStep2Active ? "In Progress" : "Queued",
      desc: isStep2Done
        ? "Items verified, quality inspected & packaged for dispatch handover."
        : isStep2Active
        ? "Merchant atelier is gathering merchandise and sealing delivery box."
        : "Order awaiting merchant atelier processing slot.",
      completed: isStep2Done,
      current: isStep2Active,
    },
    {
      title: "Ofia Dispatch · Picked Up & In Transit",
      time: isStep3Done ? "Completed" : isStep3Active ? "On Road" : "Awaiting Handover",
      desc: isStep3Active
        ? "Rider assigned: Chidi Okeke (Yamaha Force · Plate: KJA-482-XA). En route to delivery address."
        : isStep3Done
        ? "Parcel picked up and completed route."
        : "Logistics rider assigned; awaiting atelier dispatch readiness.",
      completed: isStep3Done,
      current: isStep3Active,
    },
    {
      title: "Delivered & Verified via Escrow",
      time: isStep4Done ? "Delivered" : "Est. Today",
      desc: isStep4Done
        ? "Recipient confirmed receipt. Escrow payment released to merchant."
        : `Recipient OTP verification code: ${order?.id ? order.id.slice(-4).toUpperCase() : "8291"}. Present to rider upon arrival.`,
      completed: isStep4Done,
      current: false,
    },
  ];

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return { label: "Delivered", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "READY_DISPATCH":
        return { label: "In Transit", bg: "bg-blue-50 text-blue-800 border-blue-200" };
      case "IN_PREPARATION":
        return { label: "In Preparation", bg: "bg-amber-50 text-amber-800 border-amber-200" };
      case "CANCELLED":
        return { label: "Cancelled", bg: "bg-rose-50 text-rose-800 border-rose-200" };
      default:
        return { label: "Confirmed", bg: "bg-zinc-100 text-zinc-800 border-zinc-200" };
    }
  };

  const statusBadge = getStatusBadge(currentStatus);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <Link
          href={returnHref}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Return to {storeDisplayName} Storefront</span>
        </Link>

        {/* Live Pulse Indicator & Manual Refresh */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Sync Active</span>
            <span className="text-stone-400">·</span>
            <span className="text-stone-500">
              {secondsAgo <= 2 ? "Just now" : `${secondsAgo}s ago`}
            </span>
          </div>

          <button
            onClick={() => fetchOrderDetails(trackingNumber, true)}
            disabled={refreshing}
            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-50"
            title="Refresh order status now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Interactive Reference Search Form */}
      <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search reference (e.g. OFIA-2026-9021 or ORD-9021)"
              className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
          >
            Track Order
          </button>
        </form>

        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 shrink-0">
          <span>Quick seeds:</span>
          <button
            onClick={() => handlePrefill("OFIA-2026-9021")}
            className="px-2 py-0.5 rounded-md bg-stone-200/80 hover:bg-stone-300 font-mono text-[10px] text-stone-800 transition-colors"
          >
            OFIA-2026-9021
          </button>
          <button
            onClick={() => handlePrefill("OFIA-2026-9018")}
            className="px-2 py-0.5 rounded-md bg-stone-200/80 hover:bg-stone-300 font-mono text-[10px] text-stone-800 transition-colors"
          >
            OFIA-2026-9018
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && !order && (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 text-center">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h2 className="font-bold text-sm">Tracking Reference Not Found</h2>
          <p className="text-xs text-amber-700 max-w-md mx-auto">{error}</p>
          <p className="text-[11px] text-stone-500 pt-2">
            Tip: Try prefilling one of the active test orders:{" "}
            <button
              onClick={() => handlePrefill("OFIA-2026-9021")}
              className="text-blue-600 font-mono underline font-bold"
            >
              OFIA-2026-9021
            </button>
          </p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !order && (
        <div className="p-10 rounded-3xl bg-white border border-stone-200 text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-stone-200 mx-auto" />
          <div className="h-6 w-48 bg-stone-200 mx-auto rounded" />
          <div className="h-4 w-72 bg-stone-100 mx-auto rounded" />
          <div className="h-40 bg-stone-50 rounded-2xl" />
        </div>
      )}

      {/* Main Order Tracking Card */}
      {order && (
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-stone-200 shadow-xl space-y-8">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200">
                <Truck className="w-3.5 h-3.5" />
                <span>Live GPS Dispatch Tracking</span>
              </div>
              <h1 className="font-dropa text-2xl sm:text-3xl font-bold text-zinc-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Recipient: <strong>{order.customerName}</strong> · Destination:{" "}
                <span className="text-stone-700 font-medium">
                  {order.shippingAddress || "Ikoyi"}, {order.city || "Lagos"}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className={`px-4 py-2.5 rounded-2xl border text-right ${statusBadge.bg}`}>
                <div className="text-[10px] font-black uppercase tracking-wider">Status</div>
                <div className="text-sm font-bold">{statusBadge.label}</div>
              </div>
            </div>
          </div>

          {/* Stepper Progress Timeline */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Real-Time Dispatch Timeline
              </h2>
              <span className="text-[11px] text-stone-400 font-mono">
                Storefront Channel: {order.channel}
              </span>
            </div>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
              {steps.map((s, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Stepper Node Indicator */}
                  <div
                    className={`absolute -left-6 sm:-left-8 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      s.completed
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-stone-300 text-stone-400"
                    } ${s.current ? "ring-4 ring-blue-100 animate-pulse bg-blue-600 text-white border-blue-600" : ""}`}
                  >
                    {s.completed ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  <div
                    className={`flex-1 p-4 rounded-2xl border transition-all ${
                      s.current
                        ? "bg-blue-50/50 border-blue-200 shadow-sm"
                        : "bg-stone-50/70 border-stone-200/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900">{s.title}</span>
                        {s.current && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-stone-400">{s.time}</span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Purchased Items & Delivery Manifest */}
          <div className="p-5 sm:p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Purchased Items & Manifest</span>
              </div>
              <span className="text-xs text-stone-500 font-semibold">
                {order.itemCount} {order.itemCount === 1 ? "Item" : "Items"}
              </span>
            </div>

            {/* Item list */}
            <div className="space-y-3">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-stone-200/80 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 font-bold shrink-0">
                        <Package className="w-5 h-5 text-stone-500" />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 text-xs">{item.title}</div>
                        <div className="text-[11px] text-stone-500">
                          Qty: {item.quantity} · Unit: ₦{(item.price || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-zinc-900 text-xs shrink-0">
                      ₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-white border border-stone-200 text-xs font-medium text-stone-800">
                  {order.itemsSummary || "Standard Storefront Merchandise"}
                </div>
              )}
            </div>

            {/* Price & Payment Summary */}
            <div className="pt-3 border-t border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-stone-600">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>
                  Tender: <strong className="uppercase">{order.paymentMethod || "Card"}</strong> ·{" "}
                  Status: <strong className="text-emerald-700">{order.paymentStatus}</strong>
                </span>
              </div>
              <div className="text-sm font-bold text-zinc-900 sm:text-right">
                Total Paid: <span className="text-blue-600 font-dropa text-base">{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Live GPS Radar & Telemetry Mobility Canvas */}
          {(() => {
            const telemetry = dispatchInfo?.telemetry;
            const courier = dispatchInfo?.courier || {
              name: "Chidi Okeke",
              phone: "+234 803 991 2040",
              vehicleType: "Yamaha Force 155",
              plateNumber: "KJA-482-XA",
              rating: 4.95,
              totalDeliveries: 482,
            };

            const progressRatio =
              telemetry?.progressRatio ??
              (currentStatus === "DELIVERED" ? 1.0 : currentStatus === "READY_DISPATCH" ? 0.65 : 0.18);

            // Interpolate coordinate along SVG quadratic curve path
            const riderX = 100 + (700 - 100) * progressRatio;
            const riderY = 160 - Math.sin(progressRatio * Math.PI) * 75 - (progressRatio > 0.6 ? 20 : 0);

            return (
              <div className="space-y-6">
                <div className="p-5 sm:p-6 rounded-2xl bg-[#090D16] border border-stone-800 text-white space-y-4 shadow-2xl relative overflow-hidden">
                  {/* Ambient glowing background aura */}
                  <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Header Telemetry HUD */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                          <span>Live GPS Fleet Telemetry</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                            RTK-GPS
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {telemetry?.riderStatus ||
                            (currentStatus === "READY_DISPATCH"
                              ? "In Transit to Destination"
                              : currentStatus === "DELIVERED"
                              ? "Delivered & Verified"
                              : "Atelier Handover")}
                        </div>
                      </div>
                    </div>

                    {/* Dynamic HUD metrics */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-[10px] text-zinc-400 uppercase font-semibold">Speed</div>
                        <div className="text-xs sm:text-sm font-bold text-white font-mono">
                          {telemetry?.speedKmh ?? (currentStatus === "READY_DISPATCH" ? 38 : 0)}{" "}
                          <span className="text-[10px] text-zinc-400">km/h</span>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-[10px] text-zinc-400 uppercase font-semibold">Distance</div>
                        <div className="text-xs sm:text-sm font-bold text-blue-400 font-mono">
                          {telemetry?.distanceKmRemaining ?? (currentStatus === "DELIVERED" ? 0 : 1.8)}{" "}
                          <span className="text-[10px] text-zinc-400">km</span>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-[10px] text-zinc-400 uppercase font-semibold">Est. Arrival</div>
                        <div className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                          {telemetry?.etaMinutesRemaining ?? (currentStatus === "DELIVERED" ? 0 : 12)}{" "}
                          <span className="text-[10px] text-zinc-400">min</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive SVG Radar Route Visualization */}
                  <div className="relative w-full h-56 sm:h-64 rounded-xl bg-[#0B0F19] border border-white/10 overflow-hidden flex items-center justify-center">
                    {/* Radar grid background */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 50% 50%, #0069FF 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)",
                        backgroundSize: "24px 24px, 48px 48px, 48px 48px",
                      }}
                    />

                    {/* SVG Map Canvas */}
                    <svg className="w-full h-full relative z-10" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#0069FF" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* Route Path Background */}
                      <path
                        d="M 100 160 Q 280 40 460 120 T 700 80"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />

                      {/* Active Illuminated Route */}
                      <path
                        d="M 100 160 Q 280 40 460 120 T 700 80"
                        fill="none"
                        stroke="url(#routeGradient)"
                        strokeWidth="3.5"
                        strokeDasharray="6 6"
                        strokeLinecap="round"
                      />

                      {/* Origin Pin (Merchant Atelier) */}
                      <g transform="translate(100, 160)">
                        <circle r="12" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                        <circle r="5" fill="#3b82f6" />
                        <text x="0" y="24" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                          Atelier Hub
                        </text>
                      </g>

                      {/* Mid Waypoint Checkpoint */}
                      <g transform="translate(460, 120)">
                        <circle r="7" fill="#0F172A" stroke="#64748b" strokeWidth="1.5" />
                        <circle r="3" fill="#64748b" />
                        <text x="0" y="20" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="medium">
                          Falomo Bridge
                        </text>
                      </g>

                      {/* Destination Pin (Customer) */}
                      <g transform="translate(700, 80)">
                        <circle r="14" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
                        <circle r="6" fill="#10b981" />
                        <text x="0" y="26" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">
                          Destination
                        </text>
                      </g>

                      {/* Moving Rider Telemetry Pin */}
                      <g transform={`translate(${riderX}, ${riderY})`}>
                        <circle r="20" fill="#0069FF" opacity="0.25" className="animate-ping" />
                        <circle r="13" fill="#0069FF" opacity="0.4" />
                        <circle r="7" fill="#ffffff" stroke="#0069FF" strokeWidth="3" filter="url(#glow)" />
                        <g transform="translate(0, -20)">
                          <rect x="-42" y="-14" width="84" height="18" rx="9" fill="#0069FF" />
                          <text x="0" y="-2" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                            {currentStatus === "DELIVERED" ? "Delivered" : courier.name.split(" ")[0]}
                          </text>
                        </g>
                      </g>
                    </svg>

                    {/* Coordinates Overlay HUD */}
                    <div className="absolute bottom-2 left-3 text-[10px] font-mono text-zinc-500 bg-black/60 px-2.5 py-0.5 rounded backdrop-blur-sm border border-white/5">
                      LAT: {telemetry?.currentLocation?.lat ?? "6.4392"} · LNG: {telemetry?.currentLocation?.lng ?? "3.4287"}
                    </div>
                    <div className="absolute bottom-2 right-3 text-[10px] font-mono text-zinc-400 bg-black/60 px-2.5 py-0.5 rounded backdrop-blur-sm border border-white/5 flex items-center gap-1.5">
                      <Compass className="w-3 h-3 text-blue-400 animate-spin" style={{ animationDuration: "14s" }} />
                      <span>HEADING 048° NE</span>
                    </div>
                  </div>

                  {/* Waypoint Steps Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                        1
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-[10px] text-zinc-400 uppercase font-semibold">Origin Atelier</div>
                        <div className="text-xs font-medium text-white truncate">
                          {telemetry?.origin?.name || "Victoria Island Hub"}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                        2
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-[10px] text-zinc-400 uppercase font-semibold">Waypoint Checkpoint</div>
                        <div className="text-xs font-medium text-white truncate">
                          Falomo Bridge, Ikoyi
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                        3
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-[10px] text-zinc-400 uppercase font-semibold">Final Destination</div>
                        <div className="text-xs font-medium text-white truncate">
                          {order.shippingAddress || "Ikoyi, Lagos"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned Rider & Dispatch Contact Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#0F1117] text-white space-y-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-bold uppercase tracking-wider text-[#0069FF] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Assigned Logistics Rider</span>
                    </span>
                    <span>
                      OTP On Arrival:{" "}
                      <strong className="text-white font-mono bg-white/10 px-2.5 py-0.5 rounded border border-white/20">
                        {order.id ? order.id.slice(-4).toUpperCase() : "8291"}
                      </strong>
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-600/20 text-[#0069FF] font-bold flex items-center justify-center text-base border border-blue-500/30">
                        {courier.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{courier.name}</span>
                          <span className="text-[11px] text-amber-400 font-mono font-normal">
                            ★ {courier.rating || 4.95} ({courier.totalDeliveries || 480}+ trips)
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400">
                          {courier.vehicleType} · Plate: {courier.plateNumber}
                        </div>
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>GPS Tracking Active</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${courier.phone || "+2348039912040"}`}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Rider</span>
                      </a>
                      <a
                        href={`https://wa.me/${(courier.phone || "2348039912040").replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Escrow & Merchant Security Guarantee */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Funds held securely in <strong>Ofia Escrow</strong> until successful recipient OTP verification.
              </span>
            </div>
            <Link
              href={returnHref}
              className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>Back to {storeDisplayName}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <div className="min-h-screen bg-white text-[#111318] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="max-w-4xl mx-auto text-center py-24 text-stone-500 text-xs">
            Connecting to Ofia Live Logistics Gateway...
          </div>
        }
      >
        <TrackingContent />
      </Suspense>
    </div>
  );
}
