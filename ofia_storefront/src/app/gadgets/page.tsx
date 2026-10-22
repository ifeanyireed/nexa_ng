import type { Metadata } from "next";
import GadgetsStorefrontView from "./GadgetsStorefrontView";

export const metadata: Metadata = {
  title: "Gadgets Storefront | OFIA",
  description: "Flagship smartphones, pro workstations, and audiophile acoustics with verified warranties.",
};

export default function GadgetsStorefrontPage() {
  return <GadgetsStorefrontView />;
}
