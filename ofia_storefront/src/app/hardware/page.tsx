import type { Metadata } from "next";
import HardwareStorefrontView from "./HardwareStorefrontView";

export const metadata: Metadata = {
  title: "Hardware & Solar Engineering Storefront | OFIA",
  description: "Tier-1 hybrid inverters, LiFePO4 battery storage, solar panels, and COREN-certified turnkey engineering installation.",
};

export default function HardwareStorefrontPage() {
  return <HardwareStorefrontView />;
}
