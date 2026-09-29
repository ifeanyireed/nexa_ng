import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "(?<niche>[^.]+)\\.ofia\\.ng",
          }
        ],
        destination: "/:niche",
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "(?<niche>[^.]+)\\.ofia\\.ng",
          }
        ],
        destination: "/:niche/:path*",
      }
    ];
  }
};

export default nextConfig;
