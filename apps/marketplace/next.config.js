const allowedCorsOrigin =
  process.env.NEXT_PUBLIC_MARKETPLACE_STOREFRONT_URL || "http://localhost:3000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Skip type checking during build - the 35k+ line GraphQL generated client.ts
    // causes "Maximum call stack size exceeded" in TS compiler due to complex recursive types.
    // Run `pnpm type-check` separately to validate types (may need to exclude generated files).
    ignoreBuildErrors: true,
  },
  transpilePackages: ["@nimara/ui", "@nimara/infrastructure", "@nimara/domain"],
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
};

module.exports = nextConfig;
