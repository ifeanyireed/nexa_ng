import type { Metadata } from "next";
import RetailStorefrontView from "./RetailStorefrontView";
import { resolveStorefrontMetadata } from "@/lib/storefront-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return resolveStorefrontMetadata(
    "General Retail Storefront | OFIA",
    "Multi-category general merchant catalog with inventory tracking and instant delivery."
  );
}

export default function RetailStorefrontPage() {
  return <RetailStorefrontView />;
}
