"use client";

import Link from "next/link";
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, totalCount } =
    useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-zinc-900" />
            <h2 className="font-dropa font-bold text-lg text-zinc-900">Your Bag</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {totalCount} {totalCount === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-lg text-stone-500 hover:text-zinc-900 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-stone-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 text-stone-400">
              <ShoppingBag className="w-12 h-12 stroke-1 mb-3 text-stone-300" />
              <p className="font-semibold text-zinc-800 text-base">Your bag is empty</p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Explore any of our 7 vertical templates and add items to experience tailored commerce.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="pt-4 first:pt-0 flex gap-3.5 items-start">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-18 h-18 rounded-xl object-cover border border-stone-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-1">
                      {item.title}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-stone-400 hover:text-red-600 transition-colors p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Selected Variants Pill */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.selectedSize && (
                      <span className="text-[10px] font-semibold bg-stone-100 px-2 py-0.5 rounded text-stone-700">
                        Size: {item.selectedSize}
                      </span>
                    )}
                    {item.selectedColor && (
                      <span className="text-[10px] font-semibold bg-stone-100 px-2 py-0.5 rounded text-stone-700">
                        Color: {item.selectedColor}
                      </span>
                    )}
                    {item.selectedPortion && (
                      <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                        Portion: {item.selectedPortion}
                      </span>
                    )}
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                        +{item.selectedAddOns.length} add-ons
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-xs font-bold text-zinc-900">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-stone-200 text-stone-600 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-zinc-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-stone-200 text-stone-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Action */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/90 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-500 font-medium">
                <span>Subtotal</span>
                <span className="text-zinc-900 font-semibold">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-500 font-medium">
                <span>Integrated Logistics</span>
                <span className="text-emerald-700 font-semibold">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-stone-200">
                <span>Estimated Total</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ofia Escrow & Integrated Dispatch Guaranteed</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
