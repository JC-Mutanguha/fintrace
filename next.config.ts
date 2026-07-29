import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow phone testing on LAN (e.g. http://192.168.x.x:3000)
  allowedDevOrigins: ["192.168.1.77"],
};

export default nextConfig;
