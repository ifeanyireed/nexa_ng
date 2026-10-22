import type { Metadata } from "next";
import FashionStorefrontView from "./FashionStorefrontView";

export const metadata: Metadata = {
  title: "Fashion Storefront | OFIA",
  description: "Contemporary Afro-minimalist silhouettes, artisanal bespoke tailoring, and seasonal capsule drops.",
};

export default function FashionStorefrontPage() {
  return <FashionStorefrontView />;
}
