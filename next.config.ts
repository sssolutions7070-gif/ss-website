import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Don't emit AGENTS.md / CLAUDE.md on dev start.
  agentRules: false,
  images: {
    // Placeholder mockups in /public/work are first-party SVGs (no scripts).
    // Real raster screenshots added later are optimised normally.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
