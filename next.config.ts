import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every CRM page is per-user and rendered at request time, so we use the
  // classic dynamic rendering model instead of Cache Components.
  experimental: {
    // Image uploads go through Server Actions; the API accepts up to 5 MB per image.
    serverActions: { bodySizeLimit: "6mb" },
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
