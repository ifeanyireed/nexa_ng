import type { Metadata } from "next";
import CarsStorefrontView from "./CarsStorefrontView";

export const metadata: Metadata = {
  title: "Cars Storefront | OFIA",
  description: "Certified luxury, performance & executive fleet with verified 150-point inspections.",
};

export default function CarsStorefrontPage() {
  return <CarsStorefrontView />;
}
