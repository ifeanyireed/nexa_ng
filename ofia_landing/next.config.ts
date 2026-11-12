import type { NextConfig } from "next";

const ADMIN_URL =
  process.env.ADMIN_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ADMIN_API ||
  "http://localhost:3003";

const cleanAdminUrl = ADMIN_URL.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/onboarding/:path*",
        destination: `${cleanAdminUrl}/api/onboarding/:path*`,
      },
    ];
  },
};

export default nextConfig;
