import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every CRM page is per-user and rendered at request time, so we use the
  // classic dynamic rendering model instead of Cache Components.
  experimental: {
    // Uploads go through Server Actions; the API accepts up to 5 MB per file, and an
    // assistant message can carry 3 files (plus multipart overhead).
    serverActions: { bodySizeLimit: "16mb" },
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
