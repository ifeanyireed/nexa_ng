import type { Metadata } from "next";
import HomeLivingStorefrontView from "./HomeLivingStorefrontView";
import { resolveStorefrontMetadata } from "@/lib/storefront-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return resolveStorefrontMetadata(
    "Home & Living Storefront | OFIA",
    "Curated modern interior furniture, architectural furnishings, and white-glove decor delivery."
  );
}

export default function HomeLivingStorefrontPage() {
  return <HomeLivingStorefrontView />;
}
