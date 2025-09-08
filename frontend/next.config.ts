import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3001",
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDw-zy3zHlbacJgk_YBJj55fERADmrLMD0",
  },
  // 개발 도구 오버레이 비활성화
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  // Turbopack 관련 개발 도구 비활성화
  experimental: {
    turbo: {
      rules: {},
    },
  },
};

export default nextConfig;
