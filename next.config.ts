import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['pino', 'pino-pretty', 'better-sqlite3'],
};

export default nextConfig;
