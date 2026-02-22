import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Required for Docker deployment

  // Base path for reverse proxy (Traefik routes /naiwah/* to this app)
  // Only use basePath in production/docker environment
  ...(process.env.NODE_ENV === 'production' && { basePath: '/naiwah' }),

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
