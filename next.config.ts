import type { NextConfig } from "next";

const isProdEnv = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  compiler: {
    reactRemoveProperties: true,
    removeConsole: isProdEnv,
    styledComponents: true,
  },
  // Always enable compression
  compress: true,

  // We have our own linting infrastructure, so avoid Next's
  eslint: {
    ignoreDuringBuilds: true,
  },

  // This conflicts with how we use project refs and aliases
  typescript: {
    ignoreBuildErrors: true,
  },

  // Do not broadcast that we're using Next
  poweredByHeader: false,

  // Generate source maps for production builds
  productionBrowserSourceMaps: false,

  // Enable strict mode in development
  reactStrictMode: !isProdEnv,

  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;