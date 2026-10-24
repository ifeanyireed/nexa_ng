import type { Metadata } from "next";
import UnprovisionedStorefrontErrorView from "@/components/common/UnprovisionedStorefrontErrorView";

export const metadata: Metadata = {
  title: "404 Storefront Not Found | OFIA",
  description: "The requested merchant storefront workspace has not been provisioned on the Ofia Platform.",
};

export default async function UnprovisionedPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string; slug?: string; store?: string }>;
}) {
  const params = await searchParams;
  const slug = params.tenant || params.slug || params.store || "unknown";

  return <UnprovisionedStorefrontErrorView slug={slug} />;
}
