"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaModal } from "@/components/nexa/NexaModal";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  category: string;
}

const POS_PRODUCTS = [
  { id: "P-1", name: "Solar Inverter 5kVA", price: 580000, category: "Solar", stock: 8, sku: "SOL-5K" },
  { id: "P-2", name: "LiFePO4 Battery 100Ah", price: 1150000, category: "Solar", stock: 14, sku: "BAT-100" },
  { id: "P-3", name: "4K IP Security Camera", price: 45000, category: "CCTV", stock: 12, sku: "CAM-4K" },
  { id: "P-4", name: "NVR 16-Channel POE", price: 140000, category: "CCTV", stock: 6, sku: "NVR-16" },
  { id: "P-5", name: "Cat6 Cable Drum 305m", price: 65000, category: "Networking", stock: 9, sku: "CAB-CAT6" },
  { id: "P-6", name: "Biometric Time Clock", price: 85000, category: "Access", stock: 5, sku: "BIO-CLK" },
  { id: "P-7", name: "Solar Panel 450W Mono", price: 95000, category: "Solar", stock: 24, sku: "SOL-450W" },
  { id: "P-8", name: "MC4 Connectors (Pair)", price: 2500, category: "Accessories", stock: 150, sku: "ACC-MC4" },
];

export default function POSTerminalPage() {
  const [cart, setCart] = useState<CartItem[]>([
    { id: "P-1", name: "Solar Inverter 5kVA", price: 580000, qty: 1, category: "Solar" },
    { id: "P-8", name: "MC4 Connectors (Pair)", price: 2500, qty: 4, category: "Accessories" },
  ]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "TRANSFER" | "SPLIT">("CASH");
  const [cashTendered, setCashTendered] = useState<string>("600000");
  const [isSuccess, setIsSuccess] = useState(false);

  const categories = ["All", "Solar", "CCTV", "Networking", "Access", "Accessories"];

  const filteredProducts = POS_PRODUCTS.filter((p) => {
    const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const addToCart = (product: typeof POS_PRODUCTS[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1, category: product.category }];
    });
  };

  const updateQty = (id: string, delta: number) => {
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

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.075; // 7.5% VAT
  const total = subtotal + tax;
  const changeDue = Math.max(0, (parseFloat(cashTendered) || 0) - total);

  const handleCompleteSale = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setShowCheckoutModal(false);
      clearCart();
    }, 2000);
  };

  return (
    <BusinessShell
      title="Point of Sale (POS) Cashier Terminal"
      subtitle="High-speed barcode touch checkout, multi-tender payments, shift drawer balance, and thermal receipts."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/pos/sessions">
            <NexaButton size="sm" variant="outline" leftIcon={<History className="w-3.5 h-3.5" />}>
              Shift History (Z-Report)
            </NexaButton>
          </Link>
          <Link href="/erp/admin/pos/receipts">
            <NexaButton size="sm" variant="outline" leftIcon={<Receipt className="w-3.5 h-3.5" />}>
              Receipt Archive
            </NexaButton>
          </Link>
          <Link href="/erp/admin/pos/terminals">
            <NexaButton size="sm" variant="outline" leftIcon={<Sliders className="w-3.5 h-3.5" />}>
              POS Hardware
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: PRODUCT CATALOG GRID (8 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          {/* SEARCH & BARCODE INPUT */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <NexaInput
                placeholder="Scan Barcode or Search Items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="search"
                prefix={<Barcode className="w-4 h-4 text-[var(--nexa-text-muted)]" />}
              />
            </div>
          </div>

          {/* CATEGORY TABS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-[#1A56DB] text-white shadow-sm"
                    : "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-muted)] border border-[var(--nexa-border)] hover:text-[var(--nexa-text-primary)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* PRODUCTS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="p-3.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-[#1A56DB] transition-all text-left flex flex-col justify-between h-36 group cursor-pointer shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-[var(--nexa-text-muted)]">{p.sku}</span>
                    <span className="text-[10px] text-[#0E9F6E] font-bold">{p.stock} left</span>
                  </div>
                  <h4 className="text-xs font-bold text-[var(--nexa-text-primary)] group-hover:text-[#1A56DB] transition-colors mt-1 line-clamp-2">
                    {p.name}
                  </h4>
                </div>
                <div className="pt-2 border-t border-[var(--nexa-border)] flex items-center justify-between">
                  <span className="font-mono font-extrabold text-xs text-[#0E9F6E]">
                    ₦{p.price.toLocaleString()}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-[var(--nexa-bg-base)] flex items-center justify-center text-[var(--nexa-text-muted)] group-hover:bg-[#1A56DB] group-hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: LIVE REGISTER CART & TENDER (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <NexaCard variant="glass" padding="md" className="space-y-4 border border-[var(--nexa-border)]">
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#1A56DB]" />
                <span className="font-bold text-sm text-[var(--nexa-text-primary)]">Current Register Sale</span>
              </div>
              <button onClick={clearCart} className="text-xs text-[#E02424] hover:underline flex items-center gap-1">
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>

            {/* CART ITEMS LIST */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-xs text-[var(--nexa-text-muted)]">
                  Cart is empty. Tap products or scan barcode to add.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs">
                    <div className="flex-1 pr-2">
                      <div className="font-bold text-[var(--nexa-text-primary)]">{item.name}</div>
                      <div className="text-[11px] font-mono text-[var(--nexa-text-muted)]">
                        ₦{item.price.toLocaleString()} x {item.qty}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex items-center justify-center text-[var(--nexa-text-primary)]">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold font-mono px-1">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex items-center justify-center text-[var(--nexa-text-primary)]">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="w-20 text-right font-mono font-bold text-[var(--nexa-text-primary)]">
                      ₦{(item.price * item.qty).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* TOTALS COMPUTATION */}
            <div className="pt-3 border-t border-[var(--nexa-border)] space-y-1.5 text-xs">
              <div className="flex justify-between text-[var(--nexa-text-muted)]">
                <span>Subtotal</span>
                <span className="font-mono">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[var(--nexa-text-muted)]">
                <span>VAT (7.5%)</span>
                <span className="font-mono">₦{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-black text-base text-[var(--nexa-text-primary)] pt-1 border-t border-[var(--nexa-border)]">
                <span>Total Due</span>
                <span className="text-[#0E9F6E] font-mono">₦{total.toLocaleString()}</span>
              </div>
            </div>

            {/* CHECKOUT ACTION */}
            <NexaButton
              size="lg"
              variant="primary"
              disabled={cart.length === 0}
              onClick={() => setShowCheckoutModal(true)}
              className="w-full bg-gradient-to-r from-[#0E9F6E] to-[#046C4E] text-white font-extrabold text-sm py-3.5 shadow-lg"
            >
              Charge ₦{total.toLocaleString()}
            </NexaButton>
          </NexaCard>
        </div>
      </div>

      {/* CHECKOUT & MULTI-TENDER MODAL */}
      <NexaModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        title="POS Multi-Tender Payment"
        maxWidth="lg"
      >
        <div className="space-y-5 pt-2 text-xs">
          {isSuccess ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#0E9F6E]/10 text-[#0E9F6E] flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[var(--nexa-text-primary)]">Payment Approved!</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Thermal Receipt #REC-9821 Printing...</p>
            </div>
          ) : (
            <>
              {/* TOTAL BANNER */}
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-center space-y-1">
                <div className="text-xs text-[var(--nexa-text-muted)] font-semibold">Total Amount Payable</div>
                <div className="text-2xl font-black text-[#0E9F6E] font-mono">₦{total.toLocaleString()}</div>
              </div>

              {/* PAYMENT METHODS */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "CASH", label: "Cash", icon: DollarSign },
                  { id: "CARD", label: "Card / POS", icon: CreditCard },
                  { id: "TRANSFER", label: "Bank Transfer", icon: Zap },
                  { id: "SPLIT", label: "Split Tender", icon: Percent },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${
                        paymentMethod === m.id
                          ? "bg-[#1A56DB]/10 border-[#1A56DB] text-[#1A56DB]"
                          : "border-[var(--nexa-border)] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* CASH CHANGE CALCULATOR */}
              {paymentMethod === "CASH" && (
                <div className="space-y-3 p-3.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[var(--nexa-text-muted)]">Cash Tendered:</span>
                    <input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      className="w-36 px-3 py-1.5 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] text-right font-mono font-bold text-sm"
                    />
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[var(--nexa-border)] font-bold">
                    <span className="text-[var(--nexa-text-primary)]">Change Due Customer:</span>
                    <span className="text-[#E02424] font-mono text-sm">₦{changeDue.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* COMPLETE SALE BUTTON */}
              <div className="flex gap-2">
                <NexaButton
                  size="md"
                  variant="outline"
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1"
                >
                  Cancel
                </NexaButton>
                <NexaButton
                  size="md"
                  variant="primary"
                  onClick={handleCompleteSale}
                  className="flex-1 bg-[#0E9F6E] text-white font-bold"
                  leftIcon={<Printer className="w-4 h-4" />}
                >
                  Complete & Print Slip
                </NexaButton>
              </div>
            </>
          )}
        </div>
      </NexaModal>
    </BusinessShell>
  );
}
