import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
