import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix for Vercel deployment fsPath error
  reactStrictMode: true,
  // Disable telemetry
  productionBrowserSourceMaps: false,
  // Optimized images (if using next/image)
  images: {
    domains: ['relife-nexus.onrender.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // ESLint strict mode
  eslint: {
    ignoreDuringBuilds: false,
  },
  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },
  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
