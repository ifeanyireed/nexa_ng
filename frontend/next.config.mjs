/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  staticPageGenerationTimeout: 1000,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
