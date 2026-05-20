import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.env.VERCEL ? process.cwd() : undefined,
};

export default nextConfig;
