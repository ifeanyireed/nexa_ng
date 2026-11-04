"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ClipboardList,
  ShoppingCart,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  DollarSign,
  ArrowRight,
  Send,
  Eye,
  Building2,
  Package,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaModal } from "@/components/nexa/NexaModal";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";
import {
  VERTICAL_DEFINITIONS,
  getDefaultOrdersForVertical,
  CommerceOrderItem,
  VerticalKey,
} from "@/lib/verticals";

export default function VerticalOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);

  const rawVertical = (params?.vertical as string) || "fashion";
  const verticalKey: VerticalKey = (rawVertical in VERTICAL_DEFINITIONS ? rawVertical : "fashion") as VerticalKey;
  const currentVerticalDef = VERTICAL_DEFINITIONS[verticalKey] || VERTICAL_DEFINITIONS.fashion;

  // Tenant vertical enforcement: strictly lock tenant to their provisioned vertical
  useEffect(() => {
    if (activeTenant?.vertical && activeTenant.vertical in VERTICAL_DEFINITIONS && activeTenant.vertical !== verticalKey) {
      router.replace(`/erp/admin/shop/${activeTenant.vertical}/orders`);
    }
  }, [activeTenant?.vertical, verticalKey, router]);

  const [orders, setOrders] = useState<CommerceOrderItem[]>(() =>
    getDefaultOrdersForVertical(verticalKey)
  );
  const [selectedOrder, setSelectedOrder] = useState<CommerceOrderItem | null>(null);
  const [filterChannel, setFilterChannel] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveAlert, setLiveAlert] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const slug = activeTenant?.slug || "neweratransports";
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/erp/shop/orders?tenant=${encodeURIComponent(slug)}&vertical=${encodeURIComponent(verticalKey)}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (data && Array.isArray(data.orders) && data.orders.length > 0) {
        setOrders(data.orders);
      } else {
        setOrders(getDefaultOrdersForVertical(verticalKey));
      }
    } catch {
      setOrders(getDefaultOrdersForVertical(verticalKey));
    } finally {
      setIsRefreshing(false);
    }
  }, [activeTenant?.slug, verticalKey]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Live real-time SSE stream listener
  useEffect(() => {
    const slug = activeTenant?.slug || "neweratransports";
    if (typeof window === "undefined") return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/erp/shop/orders/stream?tenant=${encodeURIComponent(slug)}`);

      eventSource.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          if (event.type === "ORDER_CREATED" && event.data) {
            setOrders((prev) => {
              if (prev.some((o) => o.id === event.data.id || o.orderNumber === event.data.orderNumber)) {
                return prev;
              }
              return [event.data, ...prev];
            });
            setLiveAlert(`New Order: ${event.data.orderNumber} (${event.data.totalAmount})`);
            setTimeout(() => setLiveAlert(null), 6000);
          } else if (event.type === "ORDER_STATUS_CHANGED" && event.data) {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === event.data.id || o.orderNumber === event.data.id
                  ? { ...o, status: event.data.status }
                  : o
              )
            );
          }
        } catch {}
      };
    } catch {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [activeTenant?.slug]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const slug = activeTenant?.slug || "neweratransports";
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, status: newStatus as any } : o))
    );

    try {
      await fetch("/api/erp/shop/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          tenantSlug: slug,
        }),
      });
    } catch {
      fetchOrders();
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (o.itemsSummary && o.itemsSummary.toLowerCase().includes(search.toLowerCase()));
      const matchChannel = filterChannel === "ALL" || o.channel === filterChannel;
      const matchStatus = filterStatus === "ALL" || o.status === filterStatus;
      return matchSearch && matchChannel && matchStatus;
    });
  }, [orders, search, filterChannel, filterStatus]);

  return (
    <BusinessShell
      title={`${currentVerticalDef.name} — Orders & Fulfillment`}
      subtitle={`Live stream of customer orders, POS counter transactions, and delivery waybills for ${currentVerticalDef.name.toLowerCase()}.`}
      activeModule="shop"
      action={
        <div className="flex items-center gap-2">
          <NexaBadge variant="brand" size="sm" className="rounded-full">
            {currentVerticalDef.name}
          </NexaBadge>

          <NexaButton
            size="sm"
            variant="outline"
            onClick={fetchOrders}
            disabled={isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />}
            className="rounded-full"
          >
            {isRefreshing ? "Syncing..." : "Sync"}
          </NexaButton>

          <Link href={`/erp/admin/shop/${verticalKey}/pos`}>
            <NexaButton size="sm" variant="primary" leftIcon={<ShoppingCart className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white rounded-full font-bold shadow-xs">
              Open POS Counter
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {liveAlert && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold flex items-center justify-between animate-fade-in">
            <span>⚡ {liveAlert}</span>
            <span className="text-[10px] uppercase tracking-wider font-mono">Live SSE</span>
          </div>
        )}

        {/* KPI CARDS */}
        <ErpStatGrid
          stats={[
            {
              label: "Total Orders Recorded",
              value: `${filteredOrders.length} Orders`,
              change: "Omnichannel Stream",
              trend: "up",
              icon: <ClipboardList className="w-5 h-5 text-blue-500" />,
              sub: `Online + In-Person POS`,
            },
            {
              label: "In Preparation",
              value: `${orders.filter((o) => o.status === "IN_PREPARATION").length} In Progress`,
              change: "Kitchen / Workshop",
              trend: "neutral",
              icon: <Clock className="w-5 h-5 text-amber-500" />,
              sub: "Awaiting packaging",
            },
            {
              label: "Ready for Dispatch",
              value: `${orders.filter((o) => o.status === "READY_DISPATCH").length} Parcels`,
              change: "Assign Courier",
              trend: "up",
              icon: <Truck className="w-5 h-5 text-purple-500" />,
              sub: "Awaiting pickup",
            },
            {
              label: "Completed & Delivered",
              value: `${orders.filter((o) => o.status === "DELIVERED").length} Completed`,
              change: "Settled",
              trend: "up",
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
              sub: "Funds settled in wallet",
            },
          ]}
        />

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--nexa-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order # or customer..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="px-3 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-bold text-[var(--nexa-text-primary)] outline-none cursor-pointer"
            >
              <option value="ALL">All Channels</option>
              <option value="STOREFRONT">Storefront</option>
              <option value="POS_COUNTER">POS Register</option>
              <option value="WHATSAPP">WhatsApp</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-bold text-[var(--nexa-text-primary)] outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_PREPARATION">In Preparation</option>
              <option value="READY_DISPATCH">Ready Dispatch</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* ORDERS TABLE */}
        <NexaCard variant="glass" padding="none" className="rounded-3xl border border-[var(--nexa-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-muted)] uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="p-4">Order Ref</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Channel</th>
                  <th className="p-4">Items / Summary</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[var(--nexa-text-muted)]">
                      No orders match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[var(--nexa-bg-surface)]/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-[var(--nexa-text-primary)]">
                        {ord.orderNumber}
                        <span className="block text-[10px] text-[var(--nexa-text-muted)] font-normal">{ord.createdAt}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-[var(--nexa-text-primary)] block">{ord.customerName}</span>
                        <span className="text-[10px] text-[var(--nexa-text-muted)]">{ord.customerPhone}</span>
                      </td>
                      <td className="p-4">
                        <NexaBadge
                          variant={ord.channel === "POS_COUNTER" ? "purple" : "brand"}
                          size="sm"
                          className="rounded-full text-[10px]"
                        >
                          {ord.channel}
                        </NexaBadge>
                      </td>
                      <td className="p-4 max-w-xs truncate text-[var(--nexa-text-secondary)]">
                        {ord.itemsSummary || "Direct Order Item"}
                      </td>
                      <td className="p-4 font-bold text-[#1A56DB]">{ord.totalAmount}</td>
                      <td className="p-4">
                        <NexaBadge
                          variant={
                            ord.status === "DELIVERED"
                              ? "green"
                              : ord.status === "READY_DISPATCH"
                              ? "brand"
                              : ord.status === "IN_PREPARATION"
                              ? "amber"
                              : "neutral"
                          }
                          size="sm"
                          className="rounded-full text-[10px]"
                        >
                          {ord.status}
                        </NexaBadge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 rounded-lg bg-[var(--nexa-bg-base)] hover:bg-blue-500/10 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                            title="View Order Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {ord.status === "IN_PREPARATION" && (
                            <button
                              onClick={() => handleUpdateStatus(ord.id, "READY_DISPATCH")}
                              className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-bold text-[11px] cursor-pointer"
                            >
                              Dispatch
                            </button>
                          )}
                          {ord.status === "READY_DISPATCH" && (
                            <button
                              onClick={() => handleUpdateStatus(ord.id, "DELIVERED")}
                              className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                            >
                              Delivered
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </NexaCard>

        {/* ORDER DETAILS MODAL */}
        <NexaModal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={selectedOrder ? `Order ${selectedOrder.orderNumber}` : "Order Details"}
          subtitle={`Detailed customer breakdown, fulfillment status, and items summary.`}
          maxWidth="lg"
        >
          {selectedOrder && (
            <div className="space-y-5 pt-2">
              {/* Header Status & Channel Banner */}
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase tracking-wider font-extrabold block">
                    Channel & Date
                  </span>
                  <div className="flex items-center gap-2">
                    <NexaBadge
                      variant={selectedOrder.channel === "POS_COUNTER" ? "purple" : "brand"}
                      size="sm"
                      className="rounded-full text-xs"
                    >
                      {selectedOrder.channel}
                    </NexaBadge>
                    <span className="text-xs text-[var(--nexa-text-muted)] font-mono">{selectedOrder.createdAt}</span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase tracking-wider font-extrabold block">
                    Fulfillment Status
                  </span>
                  <NexaBadge
                    variant={
                      selectedOrder.status === "DELIVERED"
                        ? "green"
                        : selectedOrder.status === "READY_DISPATCH"
                        ? "brand"
                        : selectedOrder.status === "IN_PREPARATION"
                        ? "amber"
                        : "neutral"
                    }
                    size="sm"
                    className="rounded-full text-xs"
                  >
                    {selectedOrder.status}
                  </NexaBadge>
                </div>
              </div>

              {/* Customer & Delivery Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                  <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase tracking-wider font-extrabold block">
                    Customer Information
                  </span>
                  <p className="font-bold text-xs text-[var(--nexa-text-primary)]">{selectedOrder.customerName}</p>
                  {selectedOrder.customerPhone && (
                    <p className="text-xs text-[var(--nexa-text-secondary)] font-mono">{selectedOrder.customerPhone}</p>
                  )}
                  {selectedOrder.customerEmail && (
                    <p className="text-xs text-[var(--nexa-text-secondary)] truncate">{selectedOrder.customerEmail}</p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                  <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase tracking-wider font-extrabold block">
                    Delivery & Logistics
                  </span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--nexa-text-muted)]">Method:</span>
                    <span className="font-bold text-[var(--nexa-text-primary)]">{selectedOrder.deliveryMethod}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--nexa-text-muted)]">Destination:</span>
                    <span className="font-bold text-[var(--nexa-text-primary)] truncate max-w-[150px]">
                      {selectedOrder.shippingAddress || selectedOrder.city || "Standard Delivery"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--nexa-text-muted)]">Payment:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedOrder.paymentMethod || "Card / POS"}</span>
                  </div>
                </div>
              </div>

              {/* Ordered Items Breakdown */}
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3">
                <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase tracking-wider font-extrabold block">
                  Purchased Items ({selectedOrder.itemCount || 1})
                </span>
                {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                  <div className="divide-y divide-[var(--nexa-border)]">
                    {selectedOrder.items.map((it: any, idx: number) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-[var(--nexa-text-primary)] block">
                            {it.name || it.title || "Catalog Item"}
                          </span>
                          {it.sku && <span className="text-[10px] text-[var(--nexa-text-muted)] font-mono">{it.sku}</span>}
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-[var(--nexa-text-muted)] mr-2">Qty: {it.quantity || 1}</span>
                          <span className="font-bold text-[var(--nexa-text-primary)]">
                            ₦{Number(it.price || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--nexa-text-secondary)]">{selectedOrder.itemsSummary}</p>
                )}

                <div className="pt-2 border-t border-[var(--nexa-border)] flex items-center justify-between text-sm font-extrabold">
                  <span className="text-[var(--nexa-text-primary)]">Total Order Amount</span>
                  <span className="text-[#1A56DB]">{selectedOrder.totalAmount}</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--nexa-border)]">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] hover:border-blue-500 text-xs font-bold text-[var(--nexa-text-primary)] cursor-pointer"
                >
                  Print Waybill
                </button>

                <div className="flex items-center gap-2">
                  {selectedOrder.status === "IN_PREPARATION" && (
                    <NexaButton
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, "READY_DISPATCH");
                        setSelectedOrder({ ...selectedOrder, status: "READY_DISPATCH" });
                      }}
                      className="rounded-full bg-[#1A56DB] text-white font-bold"
                    >
                      Mark as Dispatched
                    </NexaButton>
                  )}
                  {selectedOrder.status === "READY_DISPATCH" && (
                    <NexaButton
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, "DELIVERED");
                        setSelectedOrder({ ...selectedOrder, status: "DELIVERED" });
                      }}
                      className="rounded-full bg-emerald-600 text-white font-bold"
                    >
                      Mark as Delivered
                    </NexaButton>
                  )}
                  <NexaButton
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedOrder(null)}
                    className="rounded-full"
                  >
                    Close
                  </NexaButton>
                </div>
              </div>
            </div>
          )}
        </NexaModal>
      </div>
    </BusinessShell>
  );
}
