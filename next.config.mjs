import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["next-intl"],
  },
  images: {
    formats: ["image/webp", "image/avif"],
  },
};

export default withNextIntl(nextConfig);
