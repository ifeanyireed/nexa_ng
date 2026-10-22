import type { Metadata } from "next";
import HomeLivingStorefrontView from "./HomeLivingStorefrontView";

export const metadata: Metadata = {
  title: "Home & Living Storefront | OFIA",
  description: "Architectural furniture, bouclé seating, and heirloom solid wood living collections.",
};

export default function HomeLivingStorefrontPage() {
  return <HomeLivingStorefrontView />;
}
