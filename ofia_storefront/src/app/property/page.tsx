import type { Metadata } from "next";
import PropertyStorefrontView from "./PropertyStorefrontView";
import { resolveStorefrontMetadata } from "@/lib/storefront-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return resolveStorefrontMetadata(
    "Property & Real Estate Storefront | OFIA",
    "Verified luxury residential listings, commercial office space, and VIP private viewing bookings."
  );
}

export default function PropertyStorefrontPage() {
  return <PropertyStorefrontView />;
}
