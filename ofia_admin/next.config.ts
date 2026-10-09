import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: '/', destination: '/ai/organizations' },
      { source: '/users', destination: '/ai/users' },
      { source: '/users/:path*', destination: '/ai/users/:path*' },
      { source: '/organizations', destination: '/ai/organizations' },
      { source: '/organizations/:path*', destination: '/ai/organizations/:path*' },
      { source: '/swarm', destination: '/ai/swarm' },
      { source: '/swarm/:path*', destination: '/ai/swarm/:path*' },
      { source: '/features', destination: '/ai/features' },
      { source: '/features/:path*', destination: '/ai/features/:path*' },
      { source: '/email', destination: '/ai/email' },
      { source: '/email/:path*', destination: '/ai/email/:path*' },
      { source: '/audit-logs', destination: '/ai/audit-logs' },
      { source: '/audit-logs/:path*', destination: '/ai/audit-logs/:path*' },
      { source: '/observability', destination: '/ai/observability' },
      { source: '/observability/:path*', destination: '/ai/observability/:path*' },
      { source: '/system', destination: '/ai/system' },
      { source: '/system/:path*', destination: '/ai/system/:path*' },
      { source: '/tenant', destination: '/tenants' },
      { source: '/tenant/:path*', destination: '/tenants/:path*' },
      { source: '/setting', destination: '/settings' },
      { source: '/setting/:path*', destination: '/settings/:path*' }
    ];
  }
};

export default nextConfig;
