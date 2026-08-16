/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.STATIC_EXPORT === "true" ? "export" : undefined,
  staticPageGenerationTimeout: 1000,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
