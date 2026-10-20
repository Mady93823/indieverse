import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Covers are served from /uploads (see src/app/uploads); only those paths may be resized.
    localPatterns: [{ pathname: "/uploads/**", search: "" }],
  },
  experimental: {
    serverActions: {
      // Covers can be up to 5 MB, plus room for the lyrics and form overhead.
      bodySizeLimit: "6mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
