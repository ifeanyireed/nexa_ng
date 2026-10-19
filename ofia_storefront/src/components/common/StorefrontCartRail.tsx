"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronRight, ShoppingBag, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/storefront";

interface StorefrontCartRailProps {
  sampleProducts?: Product[];
}

export default function StorefrontCartRail({ sampleProducts = [] }: StorefrontCartRailProps) {
  const { items, totalCount, subtotal, setIsCartOpen, addToCart } = useCart();

  return (
    <aside className="w-full bg-[#EAE7DF] rounded-[28px] lg:rounded-[32px] p-3.5 sm:p-4.5 xl:p-5 flex flex-col justify-between shadow-xs h-full overflow-hidden">
      {/* Top Header */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-300/60 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-dropa font-bold text-lg sm:text-xl text-zinc-900 tracking-tight">Cart</h3>
            {totalCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-zinc-900 text-white">
                {totalCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 hover:bg-white text-zinc-900 flex items-center justify-center transition-transform hover:scale-105 shadow-xs cursor-pointer"
            title="Open Full Bag Drawer"
          >
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Item Rows List */}
        <div className="space-y-2 flex-1 overflow-y-auto pr-1 no-scrollbar min-h-0">
          {items.length > 0 ? (
            items.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => setIsCartOpen(true)}
                className="group flex items-center justify-between p-1.5 pl-2 pr-3.5 rounded-full bg-white/90 hover:bg-white border border-stone-200/70 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-10 h-10 rounded-full object-cover border border-stone-200/60 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 truncate">
                      {item.selectedSize ? `Size: ${item.selectedSize}` : item.selectedVariant || "1 unit"}
                      {item.quantity > 1 ? ` · Qty ${item.quantity}` : ""}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
              </div>
            ))
          ) : (
            // Curated Quick Picks if bag is empty
            <div className="space-y-2">
              <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider px-2">
                Curated Quick Picks
              </div>
              {sampleProducts.slice(0, 3).map((prod) => (
                <div
                  key={prod.id}
                  className="group flex items-center justify-between p-1.5 pl-2 pr-3 rounded-full bg-white/90 hover:bg-white border border-stone-200/70 shadow-2xs transition-all"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      className="w-10 h-10 rounded-full object-cover border border-stone-200/60 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                        {prod.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-medium">
                        ₦{prod.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      addToCart({
                        productId: prod.id,
                        title: prod.title,
                        price: prod.price,
                        image: prod.images[0],
                        vertical: prod.vertical,
                        quantity: 1,
                      })
                    }
                    className="w-7 h-7 rounded-full bg-stone-100 hover:bg-zinc-900 hover:text-white text-zinc-800 flex items-center justify-center transition-colors shrink-0 shadow-xs cursor-pointer ml-1"
                    title="Quick Add to Bag"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Pill Checkout Button matching moodboard */}
      <div className="pt-2.5 mt-2 border-t border-stone-300/60 shrink-0">
        <Link
          href={totalCount > 0 ? "/checkout" : "#"}
          onClick={(e) => {
            if (totalCount === 0) {
              e.preventDefault();
              setIsCartOpen(true);
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-5 rounded-full bg-[#111318] hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm tracking-tight shadow-md hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
        >
          <span>
            {totalCount > 0 ? `(${totalCount} items) Check Out` : "View Bag"}
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Link>
      </div>
    </aside>
  );
}
