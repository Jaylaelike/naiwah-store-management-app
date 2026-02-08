import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Required for Docker deployment
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8090',
        pathname: '/api/files/**',
      },
      {
        protocol: 'http',
        hostname: 'pocketbase',
        port: '8080',
        pathname: '/api/files/**',
      },
    ],
  },
};

export default nextConfig;
