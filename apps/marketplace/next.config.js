/** @type {import('next').NextConfig} */
const allowedCorsOrigin =
  process.env.NEXT_PUBLIC_MARKETPLACE_STOREFRONT_URL || "http://localhost:3000";

/**
 * Next serves its dev-only resources to localhost only. Local development
 * behind a tunnel, which a Saleor App installation needs, must add that host.
 */
const allowedDevOrigins = [];

if (process.env.NEXT_PUBLIC_MARKETPLACE_VENDOR_URL) {
  try {
    allowedDevOrigins.push(
      new URL(process.env.NEXT_PUBLIC_MARKETPLACE_VENDOR_URL).hostname,
    );
  } catch {
    // Ignore an unparsable value; dev resources stay restricted to localhost.
  }
}

const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin({
  requestConfig: "./src/foundation/i18n/request.ts",
});

const nextConfig = withNextIntl({
  allowedDevOrigins,
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
