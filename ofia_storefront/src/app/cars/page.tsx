import type { Metadata } from "next";
import CarsStorefrontView from "./CarsStorefrontView";
import { resolveStorefrontMetadata } from "@/lib/storefront-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return resolveStorefrontMetadata(
    "Cars Storefront | OFIA",
    "Certified luxury, performance & executive fleet with verified 150-point inspections."
  );
}

export default function CarsStorefrontPage() {
  return <CarsStorefrontView />;
}
