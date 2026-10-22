import type { Metadata } from "next";
import FoodStorefrontView from "./FoodStorefrontView";

export const metadata: Metadata = {
  title: "Food Storefront | OFIA",
  description: "Gourmet Afro-fusion, wood-fired grills, and artisan pastries made fresh to order.",
};

export default function FoodStorefrontPage() {
  return <FoodStorefrontView />;
}
