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
            value: "(?!www|app|admin|erp)(?<tenant>[^.]+)\\..*",
          }
        ],
        destination: "/erp/admin",
      },
      { source: '/admin', destination: '/erp/admin' },
      { source: '/admin/:path*', destination: '/erp/admin/:path*' },
      { source: '/accountant', destination: '/erp/accountant' },
      { source: '/accountant/:path*', destination: '/erp/accountant/:path*' },
      { source: '/hr', destination: '/erp/hr' },
      { source: '/hr/:path*', destination: '/erp/hr/:path*' },
      { source: '/md', destination: '/erp/md' },
      { source: '/md/:path*', destination: '/erp/md/:path*' },
      { source: '/employee', destination: '/erp/employee' },
      { source: '/employee/:path*', destination: '/erp/employee/:path*' },
      { source: '/manager', destination: '/erp/manager' },
      { source: '/manager/:path*', destination: '/erp/manager/:path*' },
      { source: '/marketer', destination: '/erp/marketer' },
      { source: '/marketer/:path*', destination: '/erp/marketer/:path*' },
      { source: '/pos', destination: '/erp/admin/shop/pos' },
      { source: '/pos/:path*', destination: '/erp/admin/shop/pos/:path*' },
      { source: '/inventory', destination: '/erp/admin/shop/inventory' },
      { source: '/inventory/:path*', destination: '/erp/admin/shop/inventory/:path*' },
      { source: '/logistics', destination: '/erp/admin/logistics' },
      { source: '/logistics/:path*', destination: '/erp/admin/logistics/:path*' },
      { source: '/referrals', destination: '/erp/admin/shop/referrals' },
      { source: '/referrals/:path*', destination: '/erp/admin/shop/referrals/:path*' },
      { source: '/users', destination: '/erp/admin/users' },
      { source: '/users/:path*', destination: '/erp/admin/users/:path*' },
      { source: '/ops/mobility', destination: '/erp/ops/mobility' },
      { source: '/ops/mobility/:path*', destination: '/erp/ops/mobility/:path*' },
      { source: '/ops/dispatch', destination: '/erp/ops/dispatch' },
      { source: '/ops/dispatch/:path*', destination: '/erp/ops/dispatch/:path*' },
      { source: '/mobility', destination: '/erp/admin/mobility' },
      { source: '/mobility/:path*', destination: '/erp/admin/mobility/:path*' }
    ];
  }
};

export default nextConfig;
