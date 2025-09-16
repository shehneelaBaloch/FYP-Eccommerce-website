import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["framer-motion"],

  // 👇 Use SWC instead of Webpack for esm externals
  experimental: {
    esmExternals: true,
  },

  images: {
    domains: ["cdn.sanity.io"],
  },
};

export default nextConfig;
