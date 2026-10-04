"use client";

import { useState } from "react";
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

export default function CheckoutPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, subtotal, clearCart } = useCart();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Lagos");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | "crypto">("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const deliveryFee = 3500;
  const grandTotal = subtotal + (items.length > 0 ? deliveryFee : 0);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address || items.length === 0) return;

    setIsProcessing(true);

    setTimeout(() => {
      const orderRef = `OFIA-${Math.floor(100000 + Math.random() * 900000)}`;
      clearCart();
      router.push(`/order-confirmed?ref=${orderRef}&name=${encodeURIComponent(fullName)}`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-[#111318] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between pb-6 border-b border-stone-200">
          <Link
            href="/templates"
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

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      paymentMethod === "card"
                        ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 text-blue-900 font-bold"
                        : "border-stone-200 hover:border-stone-300 text-stone-700"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <span className="text-xs block">Card / Paystack</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("transfer")}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      paymentMethod === "transfer"
                        ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 text-blue-900 font-bold"
                        : "border-stone-200 hover:border-stone-300 text-stone-700"
                    }`}
                  >
                    <Building className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <span className="text-xs block">Instant Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("crypto")}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      paymentMethod === "crypto"
                        ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 text-blue-900 font-bold"
                        : "border-stone-200 hover:border-stone-300 text-stone-700"
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <span className="text-xs block">Escrow / USDT</span>
                  </button>
                </div>
              </div>

              {/* Complete Order Button */}
              <button
                type="submit"
                disabled={items.length === 0 || isProcessing}
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-stone-300 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
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
                    href="/templates"
                    className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                  >
                    Explore 7 Templates
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
