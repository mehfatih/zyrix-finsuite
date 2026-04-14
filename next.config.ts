import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["next-intl"],
  },
  images: {
    formats: ["image/webp", "image/avif"],
  },
};

export default withNextIntl(nextConfig);