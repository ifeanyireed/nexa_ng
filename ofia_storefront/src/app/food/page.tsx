import type { Metadata } from "next";
import FoodStorefrontView from "./FoodStorefrontView";
import { resolveStorefrontMetadata } from "@/lib/storefront-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return resolveStorefrontMetadata(
    "Food & Dining Storefront | OFIA",
    "Gourmet culinary experiences, artisanal catering, and express food delivery."
  );
}

export default function FoodStorefrontPage() {
  return <FoodStorefrontView />;
}
