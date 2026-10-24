import type { Metadata } from "next";
import GadgetsStorefrontView from "./GadgetsStorefrontView";
import { resolveStorefrontMetadata } from "@/lib/storefront-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return resolveStorefrontMetadata(
    "Gadgets & Tech Storefront | OFIA",
    "Flagship consumer electronics, silicon workstations, and certified technical diagnostics."
  );
}

export default function GadgetsStorefrontPage() {
  return <GadgetsStorefrontView />;
}
