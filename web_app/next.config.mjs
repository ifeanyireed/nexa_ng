/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  staticPageGenerationTimeout: 1000,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
