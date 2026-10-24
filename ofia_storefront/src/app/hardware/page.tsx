import type { Metadata } from "next";
import HardwareStorefrontView from "./HardwareStorefrontView";
import { resolveStorefrontMetadata } from "@/lib/storefront-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return resolveStorefrontMetadata(
    "Hardware & Energy Storefront | OFIA",
    "Commercial energy solutions, industrial solar power hardware, and building engineering supplies."
  );
}

export default function HardwareStorefrontPage() {
  return <HardwareStorefrontView />;
}
