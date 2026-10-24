import type { Metadata } from "next";
import BeautyStorefrontView from "./BeautyStorefrontView";
import { resolveStorefrontMetadata } from "@/lib/storefront-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return resolveStorefrontMetadata(
    "Beauty & Wellness Storefront | OFIA",
    "Luxury organic skincare, dermatological aesthetics, and spa reservations."
  );
}

export default function BeautyStorefrontPage() {
  return <BeautyStorefrontView />;
}
