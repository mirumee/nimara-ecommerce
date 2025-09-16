import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";
import withBundleAnalyzer from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin();

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const APP_SEMVER_NAME = `${process.env.npm_package_name}@${process.env.npm_package_version}`;
const isSentryAvailable =
  process.env.SENTRY_AUTH_TOKEN &&
  process.env.SENTRY_PROJECT &&
  process.env.SENTRY_ORG;

/** @type {import('next').NextConfig} */
const nextConfig = withAnalyzer(
  withNextIntl({
    redirects: async () => {
      return [
        {
          source: "/en",
          destination: "/",
          permanent: true,
        },
        {
          source: "/en/:path*",
          destination: "/:path*",
          permanent: true,
        },
        {
          source: "/us/en",
          destination: "/",
          permanent: true,
        },
        {
          source: "/us/en/:path*",
          destination: "/:path*",
          permanent: true,
        },
        {
          source: "/us",
          destination: "/",
          permanent: true,
        },
        {
          source: "/us/:path*",
          destination: "/:path*",
          permanent: true,
        },
      ];
    },
    // TODO: add redirects to footer CMS pages (instead of /pages/slug => /slug)

    env: {
      // Need to export this env, as the process is not available in the browser
      APP_SEMVER_NAME,
    },
    logging: {
      fetches: {
        // Set this to true, to see more what's cached and what's not
        fullUrl: false,
      },
    },
    turbopack: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
    images: {
      remotePatterns: [
        {
          hostname: "*.saleor.cloud",
        },
        {
          hostname: "cdn.buttercms.com",
        },
      ],
      deviceSizes: [360, 480, 640, 768, 1024],
      imageSizes: [256, 512, 768, 1024],
    },
    reactStrictMode: true,
    transpilePackages: ["@nimara/ui"],
    async headers() {
      const headers = [];
      if (process.env.NEXT_PUBLIC_VERCEL_ENV !== "production") {
        headers.push({
          headers: [
            {
              key: "X-Robots-Tag",
              value: "noindex",
            },
          ],
          source: "/:path*",
        });
      }
      return headers;
    },
    webpack: (config, { isServer }) => {
      if (isServer) {
        config.ignoreWarnings = [
          {
            message:
              /Critical dependency: the request of a dependency is an expression/,
          },
        ];
      }
      const fileLoaderRule = config.module.rules.find((rule) =>
        rule.test?.test?.(".svg"),
      );

      config.module.rules.push(
        // Reapply the existing rule, but only for svg imports ending in ?url
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/, // *.svg?url
        },
        // Convert all other *.svg imports to React components
        {
          test: /\.svg$/i,
          issuer: fileLoaderRule.issuer,
          resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
          use: ["@svgr/webpack"],
        },
      );

      // Modify the file loader rule to ignore *.svg, since we have it handled now.
      fileLoaderRule.exclude = /\.svg$/i;

      return config;
    },
  }),
);

const configWithSentry = withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
  release: APP_SEMVER_NAME,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of
  // client-side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});

export default isSentryAvailable ? configWithSentry : nextConfig;
