"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import { useCart } from "@/context/CartContext";
import {
  UtensilsCrossed,
  Clock,
  Flame,
  ChefHat,
  ShoppingBag,
  Check,
  ChevronLeft,
  Plus,
  Minus,
} from "lucide-react";

export default function FoodItemDetailPage() {
  const params = useParams();
  const store = MOCK_STORES.food;
  const { addToCart, setIsCartOpen } = useCart();

  const itemId = (params?.id as string) || "food-001";
  const item =
    MOCK_PRODUCTS.find((p) => p.id === itemId && p.vertical === "food") ||
    MOCK_PRODUCTS.find((p) => p.vertical === "food") ||
    MOCK_PRODUCTS[0];

  const meta = item.foodMeta;

  // Selected portion size
  const defaultPortion = meta?.portionSizes?.[0] || {
    name: "Regular Portion",
    price: item.price,
    serves: "1 Person",
  };
  const [selectedPortion, setSelectedPortion] = useState(defaultPortion);

  // Selected Add-ons
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  // Special instructions
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Quantity
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Compute calculated unit price
  const addOnsTotal = (meta?.addOns || [])
    .filter((addon) => selectedAddOns.includes(addon.name))
    .reduce((acc, curr) => acc + curr.price, 0);

  const unitPrice = selectedPortion.price + addOnsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddOn = (addonName: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addonName)
        ? prev.filter((a) => a !== addonName)
        : [...prev, addonName]
    );
  };

  const handleAddToCart = () => {
    addToCart({
      productId: item.id,
      title: item.title,
      price: unitPrice,
      image: item.images[0],
      quantity,
      vertical: "food",
      selectedPortion: selectedPortion.name,
      selectedAddOns,
      specialInstructions: specialInstructions.trim() || undefined,
    });

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      setIsCartOpen(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#1E1B18] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <Link
          href="/food/menu"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-amber-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image & Dish Info (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-md">
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              {meta?.prepTime && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-zinc-950/80 text-white flex items-center gap-1.5 backdrop-blur-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Prep: {meta.prepTime}</span>
                </div>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  {item.category}
                </span>
                {meta?.calories && (
                  <span className="text-[10px] font-semibold text-stone-400">
                    · ~{meta.calories} kcal
                  </span>
                )}
              </div>

              <h1 className="font-dropa text-2xl font-bold text-zinc-900">
                {item.title}
              </h1>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                {item.description}
              </p>

              {meta?.dietary && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {meta.dietary.map((d) => (
                    <span
                      key={d}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Customization Wizard (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            {/* 1. Portion Selection */}
            {meta?.portionSizes && meta.portionSizes.length > 0 && (
              <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-dropa text-base font-bold text-zinc-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                    <span>Choose Serving Portion</span>
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    Required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {meta.portionSizes.map((portion) => {
                    const isSelected = selectedPortion.name === portion.name;
                    return (
                      <button
                        key={portion.name}
                        type="button"
                        onClick={() => setSelectedPortion(portion)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "border-amber-600 bg-amber-50/60 ring-2 ring-amber-600/20"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <span className="font-bold text-xs text-zinc-900 block">
                          {portion.name}
                        </span>
                        <span className="text-[11px] text-stone-500 block">
                          Serves: {portion.serves}
                        </span>
                        <span className="font-dropa text-xs font-bold text-amber-700 block mt-2">
                          {store.currency}{portion.price.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Add-Ons & Extras */}
            {meta?.addOns && meta.addOns.length > 0 && (
              <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-dropa text-base font-bold text-zinc-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                    <span>Pair With Add-On Sides</span>
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Optional
                  </span>
                </div>

                <div className="space-y-2">
                  {meta.addOns.map((addon) => {
                    const isChecked = selectedAddOns.includes(addon.name);
                    return (
                      <div
                        key={addon.name}
                        onClick={() => toggleAddOn(addon.name)}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? "border-amber-600 bg-amber-50/40"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              isChecked
                                ? "bg-amber-600 border-amber-600 text-white"
                                : "border-stone-300 bg-white"
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-xs font-semibold text-zinc-900">
                            {addon.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-amber-800">
                          +{store.currency}{addon.price.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Special Cooking Notes */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-3">
              <h3 className="font-dropa text-base font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                <span>Chef & Preparation Notes</span>
              </h3>
              <p className="text-xs text-stone-500 font-light">
                Specify spice intensity (extra spicy, mild), sauce packing preferences, or allergy notes for our culinary brigade.
              </p>
              <textarea
                rows={2}
                placeholder="e.g. Mild pepper heat, separate salad dressing, extra lime..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Total Price & Add to Cart Sticky Box */}
            <div className="p-6 rounded-3xl bg-zinc-900 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    Calculated Order Total
                  </span>
                  <span className="font-dropa text-2xl sm:text-3xl font-bold">
                    {store.currency}{totalPrice.toLocaleString()}
                  </span>
                </div>

                {/* Quantity Controller */}
                <div className="flex items-center gap-3 bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1 hover:text-amber-400 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-xs min-w-4 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1 hover:text-amber-400 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addedSuccess}
                className={`w-full py-4 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  addedSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20"
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Your Order!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Order · {store.currency}{totalPrice.toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
