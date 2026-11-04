"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  Barcode,
  CheckCircle2,
  CreditCard,
  DollarSign,
  History,
  Minus,
  Percent,
  Plus,
  Printer,
  QrCode,
  Receipt,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingCart,
  Sliders,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaModal } from "@/components/nexa/NexaModal";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";
import {
  VERTICAL_DEFINITIONS,
  getDefaultPosProductsForVertical,
  VerticalKey,
  PosProductItem,
} from "@/lib/verticals";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  category: string;
}

export default function VerticalPOSPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);

  const rawVertical = (params?.vertical as string) || "fashion";
  const verticalKey: VerticalKey = (rawVertical in VERTICAL_DEFINITIONS ? rawVertical : "fashion") as VerticalKey;
  const currentVerticalDef = VERTICAL_DEFINITIONS[verticalKey] || VERTICAL_DEFINITIONS.fashion;

  // Tenant vertical enforcement: strictly lock tenant to their provisioned vertical
  React.useEffect(() => {
    if (activeTenant?.vertical && activeTenant.vertical in VERTICAL_DEFINITIONS && activeTenant.vertical !== verticalKey) {
      router.replace(`/erp/admin/shop/${activeTenant.vertical}/pos`);
    }
  }, [activeTenant?.vertical, verticalKey, router]);

  const [products, setProducts] = useState<PosProductItem[]>(() =>
    getDefaultPosProductsForVertical(verticalKey)
  );
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const fetchLiveProducts = React.useCallback(async () => {
    const slug = activeTenant?.slug || (verticalKey === "fashion" ? "funmyclothing" : verticalKey === "cars" ? "neweratransports" : "reedbreed");
    setIsLoadingProducts(true);
    try {
      const res = await fetch(`/api/erp/shop/products?tenant=${encodeURIComponent(slug)}&vertical=${encodeURIComponent(verticalKey)}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        const liveItems: PosProductItem[] = data.products.map((p: any) => ({
          id: p.id,
          name: p.name || p.title,
          price: Number(p.price) || 0,
          formattedPrice: p.formattedPrice || `₦${(Number(p.price) || 0).toLocaleString()}`,
          category: p.category || "General",
          stock: typeof p.stock === "number" ? p.stock : 10,
          sku: p.sku || `SKU-${p.id}`,
        }));

        const defaults = getDefaultPosProductsForVertical(verticalKey);
        const combined = [...liveItems];
        defaults.forEach((d) => {
          if (!combined.some((c) => c.sku === d.sku || c.name.toLowerCase() === d.name.toLowerCase())) {
            combined.push(d);
          }
        });
        setProducts(combined);
      }
    } catch {
      // Retain existing products
    } finally {
      setIsLoadingProducts(false);
    }
  }, [activeTenant?.slug, verticalKey]);

  React.useEffect(() => {
    fetchLiveProducts();
  }, [fetchLiveProducts]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("+234 ");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "TRANSFER" | "SPLIT">("CARD");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ["ALL", ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "ALL" || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, selectedCategory]);

  const addToCart = (product: PosProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          category: product.category,
        },
      ];
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    const slug = activeTenant?.slug || (verticalKey === "fashion" ? "funmyclothing" : verticalKey === "cars" ? "neweratransports" : "reedbreed");
    const orderNumber = `POS-${verticalKey.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`;
    const itemsSummary = cart.map((i) => `${i.qty}x ${i.name}`).join(", ");

    const payload = {
      orderNumber,
      tenantSlug: slug,
      customerName,
      customerPhone,
      channel: "POS_COUNTER",
      status: "DELIVERED",
      paymentStatus: "PAID",
      deliveryMethod: "STORE_PICKUP",
      paymentMethod,
      itemsSummary,
      itemCount: cart.reduce((acc, c) => acc + c.qty, 0),
      totalAmount: `₦${total.toLocaleString()}`,
      rawAmount: total,
      vertical: verticalKey,
      items: cart.map((i) => ({
        id: i.id,
        productId: i.id,
        sku: products.find((p) => p.id === i.id)?.sku || i.id,
        title: i.name,
        price: i.price,
        quantity: i.qty,
      })),
    };

    try {
      const res = await fetch("/api/erp/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setCompletedOrder({
          orderNumber,
          customerName,
          customerPhone,
          items: cart,
          subtotal,
          discountAmount,
          total,
          paymentMethod,
          date: new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
        clearCart();
        setDiscountPercent(0);
        setIsCheckoutOpen(false);
      }
    } catch (err) {
      console.error("POS transaction failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <BusinessShell
      title={`${currentVerticalDef.name} — Point of Sale (POS)`}
      subtitle={`Walk-in counter register for ${currentVerticalDef.name.toLowerCase()}: Rapid barcode search, split payments, and real-time receipt generation.`}
      activeModule="shop"
      action={
        <div className="flex items-center gap-2">
          <NexaBadge variant="brand" size="sm" className="rounded-full">
            {currentVerticalDef.name}
          </NexaBadge>

          <NexaButton
            size="sm"
            variant="outline"
            onClick={fetchLiveProducts}
            disabled={isLoadingProducts}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoadingProducts ? "animate-spin text-blue-600" : ""}`} />}
            className="rounded-full"
          >
            {isLoadingProducts ? "Syncing..." : "Sync Products"}
          </NexaButton>

          <Link href={`/erp/admin/shop/${verticalKey}/orders`}>
            <NexaButton size="sm" variant="outline" leftIcon={<History className="w-3.5 h-3.5" />} className="rounded-full">
              Orders Log
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: PRODUCT SELECTION GRID (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)]">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--nexa-text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${currentVerticalDef.productTermPlural.toLowerCase()}...`}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === c
                      ? "bg-[#1A56DB] text-white shadow-xs"
                      : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)] hover:border-gray-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* ITEM TILES */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className="p-3.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-[#1A56DB] transition-all cursor-pointer flex flex-col justify-between space-y-3 group shadow-xs active:scale-98"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--nexa-text-muted)] mb-1">
                    <span>{p.category}</span>
                    <span className="font-mono">{p.sku}</span>
                  </div>
                  <h4 className="font-bold text-xs text-[var(--nexa-text-primary)] line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {p.name}
                  </h4>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--nexa-border)]">
                  <span className="font-bold text-xs text-[#1A56DB]">{p.formattedPrice || `₦${p.price.toLocaleString()}`}</span>
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:bg-[#1A56DB] group-hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CART & TICKET REGISTER (5 COLS) */}
        <div className="lg:col-span-5">
          <NexaCard variant="glass" padding="lg" className="rounded-3xl border border-[var(--nexa-border)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[var(--nexa-text-primary)] uppercase tracking-wider">
                    Counter Ticket
                  </h3>
                  <span className="text-[10px] text-[var(--nexa-text-muted)]">
                    Register 01 · {currentVerticalDef.name}
                  </span>
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* CUSTOMER IDENTIFIER */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
                className="px-2.5 py-1.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] outline-none"
              />
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Customer Phone"
                className="px-2.5 py-1.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold text-[var(--nexa-text-primary)] font-mono outline-none"
              />
            </div>

            {/* CART ITEMS LIST */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--nexa-text-muted)] border border-dashed border-[var(--nexa-border)] rounded-2xl">
                  Register empty. Click {currentVerticalDef.productTermPlural.toLowerCase()} on the left to add to counter cart.
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between text-xs"
                  >
                    <div className="max-w-[160px]">
                      <span className="font-bold text-[var(--nexa-text-primary)] block truncate">{item.name}</span>
                      <span className="text-[10px] text-[var(--nexa-text-muted)]">₦{item.price.toLocaleString()} each</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-[var(--nexa-border)] rounded-lg bg-[var(--nexa-bg-surface)]">
                        <button
                          onClick={() => updateCartQty(item.id, -1)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 rounded-l-lg cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-bold font-mono text-[11px]">{item.qty}</span>
                        <button
                          onClick={() => updateCartQty(item.id, 1)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 rounded-r-lg cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-[#1A56DB] min-w-[70px] text-right font-mono">
                        ₦{(item.price * item.qty).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* QUICK DISCOUNT SELECTOR */}
            <div className="pt-2 border-t border-[var(--nexa-border)]">
              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--nexa-text-muted)] mb-1.5">
                <span className="flex items-center gap-1">
                  <Percent className="w-3 h-3 text-emerald-500" /> Apply Discount
                </span>
                <span className="text-emerald-600 font-mono">{discountPercent}% Applied</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[0, 5, 10, 15, 20].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiscountPercent(d)}
                    className={`py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                      discountPercent === d
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:border-gray-400"
                    }`}
                  >
                    {d === 0 ? "None" : `${d}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* TOTALS & SUMMARY */}
            <div className="pt-3 border-t border-[var(--nexa-border)] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[var(--nexa-text-secondary)]">
                <span>Subtotal</span>
                <span className="font-mono font-semibold">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-[var(--nexa-text-secondary)]">
                <span>Discount</span>
                <span className="font-mono text-emerald-600 font-semibold">-₦{discountAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[var(--nexa-border)] font-extrabold text-sm text-[var(--nexa-text-primary)]">
                <span>Total Due</span>
                <span className="text-[#1A56DB] font-mono text-base">₦{total.toLocaleString()}</span>
              </div>
            </div>

            {/* CHECKOUT ACTION */}
            <NexaButton
              size="lg"
              variant="primary"
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full rounded-2xl bg-[#1A56DB] text-white font-bold cursor-pointer"
            >
              Charge ₦{total.toLocaleString()} →
            </NexaButton>
          </NexaCard>
        </div>
      </div>

      {/* CHECKOUT TENDER MODAL */}
      <NexaModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Complete Counter Transaction"
        subtitle={`Select payment method for ${customerName} (${cart.length} items)`}
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
            <span className="text-xs text-[var(--nexa-text-muted)] block uppercase font-bold tracking-wider">
              Amount Due
            </span>
            <span className="text-2xl font-black text-[#1A56DB] font-mono">
              ₦{total.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "CARD", label: "POS Terminal (Card)", icon: <CreditCard className="w-4 h-4" /> },
              { id: "CASH", label: "Cash Tender", icon: <DollarSign className="w-4 h-4" /> },
              { id: "TRANSFER", label: "Bank Transfer", icon: <QrCode className="w-4 h-4" /> },
              { id: "SPLIT", label: "Split Payment", icon: <Sliders className="w-4 h-4" /> },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPaymentMethod(m.id as any)}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === m.id
                    ? "border-[#1A56DB] bg-blue-50/20 dark:bg-blue-900/20 text-[#1A56DB]"
                    : "border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)]"
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--nexa-border)]">
            <NexaButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCheckoutOpen(false)}
              className="rounded-full"
            >
              Cancel
            </NexaButton>
            <NexaButton
              type="button"
              variant="primary"
              size="sm"
              disabled={isProcessing}
              onClick={handleCheckoutSubmit}
              className="rounded-full bg-[#1A56DB] text-white font-bold"
            >
              {isProcessing ? "Processing..." : "Complete & Print Receipt"}
            </NexaButton>
          </div>
        </div>
      </NexaModal>

      {/* COMPLETED RECEIPT MODAL */}
      <NexaModal
        isOpen={Boolean(completedOrder)}
        onClose={() => setCompletedOrder(null)}
        title="Transaction Completed"
        subtitle={`Order #${completedOrder?.orderNumber} has been logged and settled.`}
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-[var(--nexa-text-muted)]">Receipt Ref:</span>
              <span className="font-mono font-bold">{completedOrder?.orderNumber}</span>
            </div>
            {completedOrder?.date && (
              <div className="flex justify-between">
                <span className="text-[var(--nexa-text-muted)]">Date & Time:</span>
                <span className="text-[var(--nexa-text-secondary)] font-mono">{completedOrder?.date}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[var(--nexa-text-muted)]">Customer:</span>
              <span className="font-bold">{completedOrder?.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--nexa-text-muted)]">Tender:</span>
              <span className="font-bold">{completedOrder?.paymentMethod}</span>
            </div>

            {completedOrder?.items && completedOrder.items.length > 0 && (
              <div className="pt-2 border-t border-[var(--nexa-border)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)] block mb-1">
                  Items Purchased
                </span>
                {completedOrder.items.map((itm: any) => (
                  <div key={itm.id} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[170px]">{itm.qty}x {itm.name}</span>
                    <span className="font-mono text-[var(--nexa-text-secondary)]">₦{(itm.price * itm.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {completedOrder?.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold pt-1">
                <span>Discount Applied:</span>
                <span className="font-mono">-₦{completedOrder.discountAmount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-[var(--nexa-border)] font-bold text-sm">
              <span>Total Paid:</span>
              <span className="text-[#1A56DB] font-mono">₦{completedOrder?.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <NexaButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="rounded-full"
            >
              Print Slip
            </NexaButton>
            <NexaButton
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setCompletedOrder(null)}
              className="rounded-full bg-[#1A56DB] text-white font-bold"
            >
              New Sale
            </NexaButton>
          </div>
        </div>
      </NexaModal>
    </BusinessShell>
  );
}
