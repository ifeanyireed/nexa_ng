import type { NextConfig } from "next";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "https://ofia-user-service.onrender.com";
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "https://ofia-ai-service.onrender.com";
const MARKETPLACE_SERVICE_URL = process.env.MARKETPLACE_SERVICE_URL || "https://ofia-marketplace-service.onrender.com";
const ERP_SERVICE_URL = process.env.ERP_SERVICE_URL || "https://ofia-erp-service.onrender.com";
const LOGISTICS_SERVICE_URL = process.env.LOGISTICS_SERVICE_URL || "https://ofia-logistics-service.onrender.com";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/auth/:path*",
        destination: `${USER_SERVICE_URL}/api/v1/auth/:path*`,
      },
      {
        source: "/api/v1/users/:path*",
        destination: `${USER_SERVICE_URL}/api/v1/:path*`,
      },
      {
        source: "/api/v1/ai/:path*",
        destination: `${AI_SERVICE_URL}/api/v1/gtm/:path*`,
      },
      {
        source: "/api/v1/marketplace/:path*",
        destination: `${MARKETPLACE_SERVICE_URL}/api/v1/:path*`,
      },
      {
        source: "/api/v1/discovery/:path*",
        destination: `${MARKETPLACE_SERVICE_URL}/discovery/:path*`,
      },
      {
        source: "/api/v1/erp/:path*",
        destination: `${ERP_SERVICE_URL}/api/v1/:path*`,
      },
      {
        source: "/api/v1/logistics/:path*",
        destination: `${LOGISTICS_SERVICE_URL}/api/v1/logistics/:path*`,
      },
    ];
  },
};

export default nextConfig;
