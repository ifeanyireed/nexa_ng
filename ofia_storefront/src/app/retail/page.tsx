import type { Metadata } from "next";
import RetailStorefrontView from "./RetailStorefrontView";

export const metadata: Metadata = {
  title: "Multi-Department Retail & Gift Storefront | OFIA",
  description: "Curated literature anthologies, artisan keepsakes, lifestyle essentials, and complimentary monogram laser engraving.",
};

export default function RetailStorefrontPage() {
  return <RetailStorefrontView />;
}
