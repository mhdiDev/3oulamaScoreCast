import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: 'crests.football-data.org' }, // logos équipes
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google avatars
    ],
  },
};

export default nextConfig;
