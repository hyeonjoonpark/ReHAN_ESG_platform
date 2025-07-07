import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL || "http://localhost:3001"}/:path*`,
      },
    ];
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3001",
  },
};

export default nextConfig;
