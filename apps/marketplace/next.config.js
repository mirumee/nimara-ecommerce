/** @type {import('next').NextConfig} */
const allowedCorsOrigin =
  process.env.NEXT_PUBLIC_MARKETPLACE_STOREFRONT_URL || "http://localhost:3000";

const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin({
  requestConfig: "./src/foundation/i18n/request.ts",
});

const nextConfig = withNextIntl({
  transpilePackages: [
    "@editorjs/editorjs",
    "@editorjs/header",
    "@editorjs/list",
    "@editorjs/paragraph",
    "@nimara/ui",
    "@nimara/infrastructure",
    "@nimara/domain",
    "@nimara/i18n",
  ],
  images: {
    remotePatterns: [
      {
        hostname: "*.saleor.cloud",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: allowedCorsOrigin },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Saleor-Domain, Authorization, saleor-signature, saleor-event, saleor-api-url",
          },
        ],
      },
    ];
  },
  output: "standalone",
});

module.exports = nextConfig;
