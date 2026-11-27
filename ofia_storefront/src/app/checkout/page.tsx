"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowRight,
  ChevronLeft,
  Trash2,
  CreditCard,
  Building,
  Check,
  Lock,
} from "lucide-react";

import { CartItem } from "@/types/storefront";
import { useStorefrontTenant } from "@/context/StorefrontTenantContext";
import { useBuyerAuth } from "@/context/BuyerAuthContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, subtotal, clearCart, activeVertical } = useCart();
  const { tenantSlug, handshake, store } = useStorefrontTenant();
  const { buyer, isAuthenticated, isLoading: isAuthLoading, requireAuthModal, syncWithOrder } =
    useBuyerAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Lagos");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("card");
  const [selectedRoute, setSelectedRoute] = useState<"standard" | "protected_escrow">("standard");
  const [acceptedEscrowTerms, setAcceptedEscrowTerms] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<{
    standardPayment: {
      available: boolean;
      paymentMode: "merchant_byok" | "ofia_managed";
      provider: string;
      label: string;
    };
    protectedPayment: {
      enabled: boolean;
      eligible: boolean;
      providerAvailable: boolean;
      providerName: string;
      protectionFeePct: number;
    };
  } | null>(null);

  useEffect(() => {
    const activeSlug = (tenantSlug || "").toLowerCase().trim();
    if (!activeSlug) return;
    fetch(`/api/storefront/payments?tenant=${encodeURIComponent(activeSlug)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data.standardPayment && data.protectedPayment) {
          setPaymentConfig({
            standardPayment: data.standardPayment,
            protectedPayment: data.protectedPayment,
          });
        }
      })
      .catch(() => null);
  }, [tenantSlug]);

  // Auto pre-fill checkout contact & address if buyer is logged in
  useEffect(() => {
    if (buyer) {
      if (buyer.fullName) setFullName((prev) => prev || buyer.fullName);
      if (buyer.email) setEmail((prev) => prev || buyer.email);
      if (buyer.phone) setPhone((prev) => prev || buyer.phone);
      if (buyer.addresses && buyer.addresses.length > 0) {
        const def = buyer.addresses.find((a) => a.isDefault) || buyer.addresses[0];
        if (def) {
          setAddress((prev) => prev || def.street);
          if (def.city) setCity((prev) => prev || def.city);
        }
      }
    }
  }, [buyer]);

  // Escrow is opt-in if enabled in tenant payment settings or storefront config
  // Hidden by default: only shown when the merchant turned it on AND the escrow provider keys are set in .env
  const escrowProviderAvailable = Boolean(paymentConfig?.protectedPayment?.providerAvailable);
  const tenantAllowsEscrow = Boolean(
    paymentConfig?.protectedPayment &&
      paymentConfig.protectedPayment.enabled &&
      paymentConfig.protectedPayment.eligible &&
      escrowProviderAvailable
  );
  const protectionFeePct = paymentConfig?.protectedPayment?.protectionFeePct ?? 2.5;

  const deliveryFee = 3500;
  const baseTotal = subtotal + (items.length > 0 ? deliveryFee : 0);
  const isEscrowSelected = selectedRoute === "protected_escrow";
  const protectionFee = isEscrowSelected ? Math.round(baseTotal * (protectionFeePct / 100)) : 0;
  const grandTotal = baseTotal + protectionFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    if (!isAuthenticated) {
      requireAuthModal("Please sign in or create a storefront account to complete checkout.");
      return;
    }
    if (!fullName || !phone || !address || items.length === 0) return;

    if (!tenantSlug) {
      setCheckoutError("Tenant storefront context is required to complete checkout.");
      return;
    }

    if (isEscrowSelected) {
      if (!tenantAllowsEscrow) {
        setCheckoutError("Protected Payment (Escrow) is not enabled for this merchant.");
        return;
      }
      if (!escrowProviderAvailable) {
        setCheckoutError(
          "Protected Payment is currently unavailable because the approved escrow partner cannot be reached. Per platform policy, your order was NOT converted to a standard payment."
        );
        return;
      }
      if (!acceptedEscrowTerms) {
        setCheckoutError("Please accept the Protected Payment escrow custody and release terms before paying.");
        return;
      }
    }

    setIsProcessing(true);
    const targetSlug = tenantSlug.toLowerCase().trim();
    const isEscrowActive = isEscrowSelected;

    const orderPayload = {
      tenantSlug: targetSlug,
      tenantId: handshake?.tenantId || `org-${targetSlug}`,
      customerName: fullName,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: address,
      city: city,
      paymentMethod: paymentMethod,
      channel: "STOREFRONT",
      isEscrow: isEscrowActive,
      escrowStatus: isEscrowActive ? "AWAITING_FUNDING" : "NONE",
      settlementStatus: "PENDING",
      items: items.map((i) => ({
        id: i.id,
        productId: i.productId,
        sku: i.sku,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        selectedVariant: i.selectedVariant,
        selectedPrint: i.selectedPrint,
        selectedPrintImage: i.selectedPrintImage,
        selectedColor: i.selectedColor,
        selectedSize: i.selectedSize,
      })),
      itemsSummary: items
        .map((i) => {
          const variantTags = [i.selectedPrint, i.selectedColor, i.selectedSize].filter(Boolean).join(" · ");
          return `${i.title}${variantTags ? ` (${variantTags})` : ""} (x${i.quantity})`;
        })
        .join(", "),
      itemCount: items.reduce((acc, i) => acc + i.quantity, 0),
      totalAmount: `₦${grandTotal.toLocaleString()}`,
      rawAmount: grandTotal,
      status: "AWAITING_PAYMENT",
      paymentStatus: "PENDING",
      deliveryMethod: "UNASSIGNED",
    };

    try {
      // 1. Create authoritative order in AWAITING_PAYMENT state
      const res = await fetch("/api/storefront/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.order) {
        throw new Error(data?.error || "Unable to create order");
      }

      const orderId = data.order.id;
      const orderRef = data.order.orderNumber;

      // 2. Initialize & verify payment route server-side (never declare paid without backend verification)
      const payRes = await fetch("/api/storefront/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "INITIALIZE_PAYMENT",
          tenantSlug: targetSlug,
          orderId,
          orderNumber: orderRef,
          requestedMode: isEscrowActive ? "protected_escrow" : "standard",
          baseAmount: baseTotal,
          rawAmount: grandTotal,
          paymentMethod,
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
        }),
      });
      const payData = await payRes.json().catch(() => null);
      if (!payRes.ok || !payData?.success) {
        throw new Error(
          payData?.error ||
            "Payment verification failed. Your order was not charged."
        );
      }

      syncWithOrder({
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: address,
        city: city,
      });

      clearCart();
      const redirectTenant = `&tenant=${encodeURIComponent(targetSlug)}`;
      const escrowParam = `&escrow=${isEscrowActive ? "1" : "0"}`;
      const payRefParam = payData.providerReference
        ? `&paymentRef=${encodeURIComponent(payData.providerReference)}`
        : "";
      router.push(
        `/order-confirmed?ref=${encodeURIComponent(orderRef)}&name=${encodeURIComponent(fullName)}${redirectTenant}${escrowParam}${payRefParam}`
      );
    } catch (err: any) {
      setCheckoutError(err?.message || "Checkout payment initialization failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111318] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between pb-6 border-b border-stone-200">
          <Link
            href={tenantSlug ? "/" : "/templates"}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Checkout Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-1">
              <h1 className="font-dropa text-2xl sm:text-3xl font-bold text-stone-900">
                Express Checkout
              </h1>
              <p className="text-xs text-stone-500">
                Provide your dispatch contact and delivery destination in Nigeria or international.
              </p>
            </div>

            {!isAuthLoading && !isAuthenticated && (
              <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200/90 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-dropa text-base font-bold text-amber-950">
                      Storefront Account Required for Checkout
                    </h3>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Please sign in or create your storefront customer account to place your order, track delivery, and access saved bespoke presets.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      requireAuthModal(
                        "Sign in or create a storefront account to unlock checkout and place your order."
                      )
                    }
                    className="px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-sm cursor-pointer shrink-0"
                  >
                    Sign In / Create Account
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {/* Customer Contact */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-dropa text-base font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                  <span>Customer Contact</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Babatunde Adeleke"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Phone Number (WhatsApp Dispatch)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+234 800 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Email for Receipt
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="buyer@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-dropa text-base font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span>Delivery Address</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Street Address & Apartment / Estate Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 14 Admiralty Way, Block B4, Lekki Phase 1"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-stone-600 block mb-1">
                        State / City
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="Lagos">Lagos State (Same-Day / Next-Day)</option>
                        <option value="Abuja">Abuja FCT (Express Air Courier)</option>
                        <option value="Port Harcourt">Port Harcourt (Express Courier)</option>
                        <option value="Other">Other States</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-600 block mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        disabled
                        value="Nigeria"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-100 text-stone-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-dropa text-base font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                  <span>Payment Method</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      paymentMethod === "card"
                        ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 text-blue-900 font-bold"
                        : "border-stone-200 hover:border-stone-300 text-stone-700"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <span className="text-xs block font-bold">Debit / Credit Card</span>
                    <span className="text-[10px] text-stone-500 block">Mastercard, Visa, Verve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("transfer")}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      paymentMethod === "transfer"
                        ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 text-blue-900 font-bold"
                        : "border-stone-200 hover:border-stone-300 text-stone-700"
                    }`}
                  >
                    <Building className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <span className="text-xs block font-bold">Instant Bank Transfer</span>
                    <span className="text-[10px] text-stone-500 block">Virtual Account Checkout</span>
                  </button>
                </div>

                {/* Payment Route Selection: Standard vs Protected Payment (Escrow) */}
                <div className="space-y-3 pt-2 border-t border-stone-100">
                  <label className="text-[11px] font-bold text-stone-700 block">
                    Choose Payment Protection Route
                  </label>

                  {/* Option 1: Standard Payment */}
                  <div
                    onClick={() => setSelectedRoute("standard")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedRoute === "standard"
                        ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/15"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs">
                        <span className="font-bold text-stone-900 block">
                          {paymentConfig?.standardPayment?.label || "Standard Payment"}
                        </span>
                        <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                          Pay through the merchant&apos;s connected payment provider ({paymentConfig?.standardPayment?.provider?.toUpperCase() || "PAYSTACK"}). No extra buyer protection fee.
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        +₦0 Fee
                      </span>
                    </div>
                  </div>

                  {/* Option 2: Protected Payment (Escrow) - fully hidden unless enabled and configured */}
                  {tenantAllowsEscrow && (
                  <div
                    onClick={() => {
                      if (tenantAllowsEscrow) setSelectedRoute("protected_escrow");
                    }}
                    className={`p-4 rounded-2xl border transition-all ${
                      !tenantAllowsEscrow
                        ? "border-stone-200 bg-stone-50 opacity-60 cursor-not-allowed"
                        : selectedRoute === "protected_escrow"
                        ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 cursor-pointer"
                        : "border-stone-200 hover:border-blue-300 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-blue-950 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Protected Payment (Escrow Partner Custody)</span>
                        </span>
                        <p className="text-[11px] text-stone-600 leading-relaxed">
                          Your funds are collected and held under the approved escrow partner&apos;s custody arrangement. The merchant receives release only after delivery is fulfilled and you confirm receipt. If an issue arises, you can report a problem on your order-details page to freeze release.
                        </p>
                        {!tenantAllowsEscrow && (
                          <p className="text-[11px] font-bold text-amber-700">
                            Protected Payment is not enabled for this merchant storefront.
                          </p>
                        )}
                        {tenantAllowsEscrow && !escrowProviderAvailable && (
                          <p className="text-[11px] font-bold text-rose-700">
                            Escrow partner is temporarily unavailable. Protected Payment cannot be initialized right now.
                          </p>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200 shrink-0">
                        +{protectionFeePct}% Fee
                      </span>
                    </div>

                    {selectedRoute === "protected_escrow" && tenantAllowsEscrow && (
                      <div className="mt-3 pt-3 border-t border-blue-200/80 space-y-2 text-[11px]">
                        <div className="flex justify-between text-blue-900 font-semibold">
                          <span>Escrow Protection Fee ({protectionFeePct}%)</span>
                          <span>₦{protectionFee.toLocaleString()}</span>
                        </div>
                        <label className="flex items-start gap-2 cursor-pointer text-blue-950 font-medium">
                          <input
                            type="checkbox"
                            checked={acceptedEscrowTerms}
                            onChange={(e) => setAcceptedEscrowTerms(e.target.checked)}
                            className="mt-0.5 w-3.5 h-3.5 rounded accent-blue-600"
                          />
                          <span>
                            I understand Protected Payment is optional, uses an independent escrow partner custody arrangement, and I accept the escrow release &amp; dispute terms.
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                  )}
                </div>

                {checkoutError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                    {checkoutError}
                  </div>
                )}

                {/* Settlement Notice */}
                <div className="flex items-center gap-2 pt-2 text-[11px] text-stone-500">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {isEscrowSelected
                      ? "Protected Payment Active · Funds safeguarded by approved escrow partner until delivery confirmation"
                      : `Standard Payment Active · Processed via ${paymentConfig?.standardPayment?.label || "verified merchant payment gateway"}`}
                  </span>
                </div>
              </div>

              {/* Complete Order Button */}
              <button
                type="submit"
                disabled={items.length === 0 || isProcessing}
                className="w-full py-4 px-6 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-stone-300 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <span>Securing Order & Payment...</span>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Pay ₦{grandTotal.toLocaleString()} & Complete Order</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-dropa text-lg font-bold text-stone-900">
                  Order Summary ({items.length} items)
                </h3>
              </div>

              {items.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto" />
                  <p className="text-xs text-stone-500">Your shopping bag is empty.</p>
                  <Link
                    href={tenantSlug ? "/" : "/templates"}
                    className="inline-block px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold"
                  >
                    {tenantSlug ? "Continue Shopping" : "Explore Storefront Templates"}
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-stone-100 max-h-96 overflow-y-auto pr-1">
                  {items.map((item: CartItem) => (
                    <div key={item.id} className="py-3 flex items-start gap-3 text-xs">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-200"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                          {item.vertical}
                        </span>
                        <h4 className="font-semibold text-stone-900 truncate">
                          {item.title}
                        </h4>
                        <div className="text-[11px] text-stone-500 flex flex-wrap gap-1 mt-0.5">
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                          {item.selectedColor && <span>· Color: {item.selectedColor}</span>}
                          {item.selectedPortion && <span>· {item.selectedPortion}</span>}
                          {item.selectedVariant && <span>· {item.selectedVariant}</span>}
                        </div>
                        <span className="font-bold text-stone-900 block mt-1">
                          ₦{item.price.toLocaleString()} × {item.quantity}
                        </span>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Calculations */}
              {items.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-stone-100 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-stone-900">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Ofia Dispatch Logistics</span>
                    <span className="font-semibold text-stone-900">₦{deliveryFee.toLocaleString()}</span>
                  </div>
                  {isEscrowSelected && (
                    <div className="flex justify-between text-blue-700 font-medium">
                      <span>Protected Payment Fee ({protectionFeePct}%)</span>
                      <span className="font-semibold">₦{protectionFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                    <span>Total Due</span>
                    <span className="font-dropa text-lg text-blue-600">₦{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
