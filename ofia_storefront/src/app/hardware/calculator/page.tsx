"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_STORES } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Calculator,
  Zap,
  BatteryCharging,
  Sun,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
  Plus,
  Minus,
  CheckCircle2,
  Wrench,
} from "lucide-react";

interface Appliance {
  id: string;
  name: string;
  watts: number;
  hoursPerDay: number;
  defaultQty: number;
  surgeMultiplier: number;
}

const APPLIANCES: Appliance[] = [
  { id: "ac-inv", name: "1.5 HP Inverter AC", watts: 1100, hoursPerDay: 8, defaultQty: 1, surgeMultiplier: 1.5 },
  { id: "fridge", name: "Double-Door Refrigerator", watts: 250, hoursPerDay: 24, defaultQty: 1, surgeMultiplier: 3.0 },
  { id: "freezer", name: "Deep Chest Freezer", watts: 350, hoursPerDay: 12, defaultQty: 0, surgeMultiplier: 3.0 },
  { id: "pump", name: "1.0 HP Borehole Water Pump", watts: 750, hoursPerDay: 1, defaultQty: 0, surgeMultiplier: 3.5 },
  { id: "tv", name: "55-65\" Smart LED TV + Audio", watts: 160, hoursPerDay: 6, defaultQty: 2, surgeMultiplier: 1.0 },
  { id: "fans", name: "Standing / Ceiling Fans", watts: 75, hoursPerDay: 12, defaultQty: 4, surgeMultiplier: 1.2 },
  { id: "lighting", name: "LED House Lighting (Per 5 Bulbs)", watts: 50, hoursPerDay: 8, defaultQty: 3, surgeMultiplier: 1.0 },
  { id: "laptops", name: "Laptops & Starlink WiFi", watts: 120, hoursPerDay: 10, defaultQty: 2, surgeMultiplier: 1.0 },
];

export default function HardwareCalculatorPage() {
  const store = MOCK_STORES["hardware"];

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    APPLIANCES.forEach((a) => {
      init[a.id] = a.defaultQty;
    });
    return init;
  });

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const results = useMemo(() => {
    let runningWatts = 0;
    let surgeWatts = 0;
    let dailyWattHours = 0;

    APPLIANCES.forEach((a) => {
      const q = quantities[a.id] || 0;
      if (q > 0) {
        const itemRunning = a.watts * q;
        runningWatts += itemRunning;
        surgeWatts += itemRunning * a.surgeMultiplier;
        dailyWattHours += itemRunning * a.hoursPerDay;
      }
    });

    // Inverter sizing: running watts + 25% safety buffer converted to kVA (PF = 0.8)
    const requiredKva = Math.max(2.5, Math.ceil(((runningWatts * 1.25) / 800) * 2) / 2);

    // Battery sizing: dailyWattHours * 1.2 / 1000 = required kWh (assuming 80% DOD for LiFePO4)
    const requiredBatteryKwh = Math.max(5.12, Math.ceil((dailyWattHours * 1.15) / 1000 / 2.5) * 2.56);

    // Solar panels: Daily kWh / 4.5 peak sun hours = kW array
    const requiredKwArray = (dailyWattHours / 1000 / 4.2);
    const panelCount550W = Math.max(4, Math.ceil((requiredKwArray * 1000) / 550 / 2) * 2);

    return {
      runningWatts,
      surgeWatts,
      dailyKwh: (dailyWattHours / 1000).toFixed(1),
      requiredKva: requiredKva >= 10 ? 10.0 : requiredKva >= 5 ? 5.0 : 3.5,
      requiredBatteryKwh: requiredBatteryKwh >= 15 ? 15.36 : requiredBatteryKwh >= 8 ? 10.24 : 5.12,
      panelCount550W,
      estimatedHardwareCost:
        (requiredKva >= 10 ? 1850000 : requiredKva >= 5 ? 1250000 : 750000) +
        (requiredBatteryKwh >= 10 ? 2150000 : 1350000) +
        (panelCount550W * 145000),
    };
  }, [quantities]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E252B] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/hardware"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Hardware Flagship</span>
          </Link>
        </div>

        {/* Heading */}
        <div className="space-y-2 border-b border-stone-200 pb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest">
            <Calculator className="w-4 h-4" />
            <span>Engineering Power Load Audit Tool</span>
          </div>
          <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
            Solar & Inverter System Sizing Calculator
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-light max-w-2xl leading-relaxed">
            Specify the appliances in your property to dynamically compute required Inverter capacity (kVA), LiFePO4 battery storage (kWh), and Tier-1 solar panel array count.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Appliance Selection Column (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h2 className="font-extrabold text-base text-slate-900">
                1. Specify Your Property Load
              </h2>
              <button
                onClick={() => {
                  const reset: Record<string, number> = {};
                  APPLIANCES.forEach((a) => (reset[a.id] = 0));
                  setQuantities(reset);
                }}
                className="text-xs font-bold text-stone-400 hover:text-slate-900"
              >
                Clear All
              </button>
            </div>

            <div className="divide-y divide-stone-100">
              {APPLIANCES.map((app) => {
                const qty = quantities[app.id] || 0;
                return (
                  <div key={app.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                        {app.name}
                      </span>
                      <span className="text-[11px] font-mono text-stone-400">
                        {app.watts}W running · ~{app.hoursPerDay} hrs/day
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQty(app.id, -1)}
                        className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-slate-700 hover:bg-stone-100 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-sm text-slate-900">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQty(app.id, 1)}
                        className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-slate-700 hover:bg-stone-100 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sizing Recommendations Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#182129] text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-md border border-stone-800">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Engineered Recommendations
                </span>
                <h3 className="text-xl font-black">Recommended Energy Package</h3>
              </div>

              {/* Inverter */}
              <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-mono">
                      Hybrid Inverter
                    </span>
                    <span className="font-extrabold text-base text-white">
                      {results.requiredKva}.0 kVA Pure Sine Wave
                    </span>
                  </div>
                </div>
              </div>

              {/* Battery */}
              <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <BatteryCharging className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-mono">
                      LiFePO4 Battery Bank
                    </span>
                    <span className="font-extrabold text-base text-white">
                      {results.requiredBatteryKwh} kWh Capacity (48V)
                    </span>
                  </div>
                </div>
              </div>

              {/* Solar Array */}
              <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-mono">
                      Solar Array Needed
                    </span>
                    <span className="font-extrabold text-base text-white">
                      {results.panelCount550W}x 550W Monocrystalline
                    </span>
                  </div>
                </div>
              </div>

              {/* Load Metrics Summary */}
              <div className="pt-3 border-t border-stone-700 grid grid-cols-2 gap-3 text-xs font-mono text-stone-300">
                <div>Running Load: <span className="font-bold text-white">{results.runningWatts}W</span></div>
                <div>Daily Energy: <span className="font-bold text-white">{results.dailyKwh} kWh/day</span></div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Link
                  href="/hardware/catalog"
                  className="w-full py-3.5 px-6 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm text-center shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Order Configured Hardware System</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/hardware/services"
                  className="w-full py-3 px-6 rounded-full border border-stone-700 bg-stone-800/60 hover:bg-stone-800 text-white font-bold text-xs text-center transition-all flex items-center justify-center gap-2"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Request COREN Physical Site Verification</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
