/** @type {import('next').NextConfig} */
const nextConfig = {
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
      bodySizeLimit: "2mb",
    },
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
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
