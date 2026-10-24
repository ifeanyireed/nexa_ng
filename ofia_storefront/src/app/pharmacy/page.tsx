import type { Metadata } from "next";
import PharmacyStorefrontView from "./PharmacyStorefrontView";
import { resolveStorefrontMetadata } from "@/lib/storefront-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return resolveStorefrontMetadata(
    "Pharmacy & Health Storefront | OFIA",
    "Verified pharmaceuticals, clinical diagnostic uploads, and on-demand prescription fulfillment."
  );
}

export default function PharmacyStorefrontPage() {
  return <PharmacyStorefrontView />;
}
