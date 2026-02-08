import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    basePath: '/noc-report',
    env: {
        NEXT_PUBLIC_BASE_PATH: '/noc-report',
    },
};

export default nextConfig;
