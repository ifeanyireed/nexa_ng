"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useStorefrontTenant } from "@/context/StorefrontTenantContext";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import { Product } from "@/types/storefront";

interface StorefrontCartRailProps {
  sampleProducts?: Product[];
}

export default function StorefrontCartRail(_props: StorefrontCartRailProps) {
  const router = useRouter();
  const { items, totalCount, subtotal, setIsCartOpen, removeFromCart, clearCart } = useCart();
  const { tenantSlug } = useStorefrontTenant();
  const { isAuthenticated, requireAuthModal } = useBuyerAuth();
  const checkoutHref =
    totalCount > 0
      ? tenantSlug
        ? `/checkout?tenant=${encodeURIComponent(tenantSlug)}`
        : "/checkout"
      : "#";

  return (
    <aside className="w-full bg-[#EAE7DF] rounded-[28px] lg:rounded-[32px] p-3.5 sm:p-4.5 xl:p-5 flex flex-col justify-between shadow-xs h-full overflow-hidden">
      {/* Top Header */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-300/60 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-dropa font-bold text-lg sm:text-xl text-zinc-900 tracking-tight">
              Cart
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-zinc-900 text-white">
              {totalCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => clearCart()}
                className="px-2.5 py-1 rounded-full bg-white/80 hover:bg-rose-50 text-stone-600 hover:text-rose-600 text-[11px] font-bold transition-colors cursor-pointer"
                title="Clear all items from bag"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 hover:bg-white text-zinc-900 flex items-center justify-center transition-transform hover:scale-105 shadow-xs cursor-pointer"
              title="Open Full Bag Drawer"
            >
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Item Rows List — Strictly Real Cart Items Only (No Hardcoded Sample Products) */}
        <div className="space-y-2 flex-1 overflow-y-auto pr-1 no-scrollbar min-h-0">
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => setIsCartOpen(true)}
                className="group flex items-center justify-between p-1.5 pl-2 pr-2 rounded-full bg-white/90 hover:bg-white border border-stone-200/70 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-10 h-10 rounded-full object-cover border border-stone-200/60 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 truncate">
                      {item.selectedSize ? `Size: ${item.selectedSize}` : item.selectedVariant || "1 unit"}
                      {item.quantity > 1 ? ` · Qty ${item.quantity}` : ""}
                      {` · ₦${(item.price * item.quantity).toLocaleString()}`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCart(item.id);
                  }}
                  aria-label={`Remove ${item.title} from bag`}
                  title="Remove item from bag"
                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-600 flex items-center justify-center transition-colors shrink-0 ml-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-3 py-6 text-stone-500">
              <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center mb-2 text-stone-400 shadow-2xs">
                <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              </div>
              <p className="text-xs font-bold text-zinc-800">Your bag is empty</p>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                Select any piece from the catalog to add it to your bag.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Pill Checkout Button */}
      <div className="pt-2.5 mt-2 border-t border-stone-300/60 shrink-0">
        {items.length > 0 && (
          <div className="flex items-center justify-between px-2 pb-2 text-xs">
            <span className="text-stone-600 font-medium">Subtotal</span>
            <span className="font-bold text-zinc-900">₦{subtotal.toLocaleString()}</span>
          </div>
        )}
        <Link
          href={checkoutHref}
          onClick={(e) => {
            if (totalCount === 0) {
              e.preventDefault();
              setIsCartOpen(true);
              return;
            }
            if (!isAuthenticated) {
              e.preventDefault();
              requireAuthModal(
                "Please sign in or create a storefront account to proceed to checkout.",
                () => router.push(checkoutHref)
              );
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-5 rounded-full bg-[#111318] hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm tracking-tight shadow-md hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
        >
          <span>{totalCount > 0 ? `(${totalCount} items) Check Out` : "View Bag"}</span>
          <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Link>
      </div>
    </aside>
  );
}
