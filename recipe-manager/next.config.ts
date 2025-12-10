import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'spoonacular.com',
      },
      {
        protocol: 'https',
        hostname: 'api.spoonacular.com',
      },
    ],
  },
};

export default nextConfig;

