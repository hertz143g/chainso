import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.CHAINSO_DIST_DIR || ".next",
  allowedDevOrigins: ["192.168.31.181"],
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
