import type { Metadata } from "next";
import FashionStorefrontView from "./FashionStorefrontView";
import { resolveStorefrontMetadata } from "@/lib/storefront-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return resolveStorefrontMetadata(
    "Fashion Storefront | OFIA",
    "Contemporary Afro-minimalist silhouettes, artisanal bespoke tailoring, and seasonal capsule drops."
  );
}

export default function FashionStorefrontPage() {
  return <FashionStorefrontView />;
}
