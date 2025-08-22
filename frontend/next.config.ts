import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3001",
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDw-zy3zHlbacJgk_YBJj55fERADmrLMD0",
  },
};

export default nextConfig;
