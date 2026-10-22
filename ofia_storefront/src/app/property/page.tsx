import type { Metadata } from "next";
import PropertyStorefrontView from "./PropertyStorefrontView";

export const metadata: Metadata = {
  title: "Property Storefront | OFIA",
  description: "Ultra-luxury waterfront penthouses, serviced residences, and executive villas.",
};

export default function PropertyStorefrontPage() {
  return <PropertyStorefrontView />;
}
