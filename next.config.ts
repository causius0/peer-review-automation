import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use empty turbopack config to acknowledge we're using Turbopack
  turbopack: {},
  // Externalize packages with native dependencies for server
  serverExternalPackages: ['pdf-parse', 'canvas', '@napi-rs/canvas'],
};

export default nextConfig;
