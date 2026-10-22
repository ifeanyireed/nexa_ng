import type { Metadata } from "next";
import BeautyStorefrontView from "./BeautyStorefrontView";

export const metadata: Metadata = {
  title: "Beauty Storefront | OFIA",
  description: "Clinical botanical skincare and master aesthetic spa studio services.",
};

export default function BeautyStorefrontPage() {
  return <BeautyStorefrontView />;
}
