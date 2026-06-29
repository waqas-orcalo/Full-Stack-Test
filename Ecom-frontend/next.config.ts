import type { NextConfig } from "next";
import { paths } from "./path";

const nextConfig: NextConfig = {
  webpack(config) {
    config.infrastructureLogging = { level: "error" };
    return config;
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: paths.products.base,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
