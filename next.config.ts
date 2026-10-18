import type { NextConfig } from "next";

// The API is called server-side only, and image URLs from object storage are the only
// cross-origin resource the browser loads, so the policy can stay tight.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
