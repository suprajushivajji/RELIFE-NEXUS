import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix for Vercel deployment fsPath error
  reactStrictMode: true,
  // Disable telemetry
  productionBrowserSourceMaps: false,
  // Images configuration - use remotePatterns for security
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'relife-nexus.onrender.com',
      },
    ],
  },
};

export default nextConfig;
