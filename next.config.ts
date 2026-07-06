import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Three.js + R3F ship modern ESM; keep them out of the server bundle warnings
  transpilePackages: ["three"],
};

export default nextConfig;
