import type { Metadata } from "next";
import PharmacyStorefrontView from "./PharmacyStorefrontView";

export const metadata: Metadata = {
  title: "Pharmacy & Wellness Storefront | OFIA",
  description: "NAFDAC-licensed clinical pharmacy dispensary, verified prescription refills, and cold-chain healthcare logistics.",
};

export default function PharmacyStorefrontPage() {
  return <PharmacyStorefrontView />;
}
