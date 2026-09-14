import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'relife-nexus.onrender.com',
      },
    ],
  },
  // Expose environment variables to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "https://relife-nexus.onrender.com",
    BACKEND_URL: process.env.BACKEND_URL ?? "https://relife-nexus.onrender.com/api",
  },
};

export default nextConfig;
