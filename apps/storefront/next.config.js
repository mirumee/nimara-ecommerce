import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * TODO: Temporary solution until 👇🏻 is merged & released.
 * https://github.com/vercel/next.js/pull/63051
 */
import * as tsImport from "ts-import";

const { TRANSLATED_PATHNAME_PREFIXES } = await tsImport.load(
  "./src/regions/config.ts",
);

const withNextIntl = createNextIntlPlugin();

const APP_SEMVER_NAME = `${process.env.npm_package_name}@${process.env.npm_package_version}`;
const isSentryAvailable =
  process.env.SENTRY_AUTH_TOKEN &&
  process.env.SENTRY_PROJECT &&
  process.env.SENTRY_ORG;

/** @type {import('next').NextConfig} */
const nextConfig = withNextIntl({
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
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: ["pino"],
  },
  images: {
    // TODO: Required for the imagges to load on Chrome when deployed with Vercel.
    // Remove when the issue is fixed.
    loader: "custom",
    loaderFile: "./src/lib/sanityImageLoader.ts",
    remotePatterns: [
      {
        hostname: "*.saleor.cloud",
      },
    ],
  },
  reactStrictMode: true,
  transpilePackages: ["@nimara/ui"],

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [{ module: /opentelemetry/ }];
    }
    config.module.rules.push({
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            prettier: true,
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: "preset-default",
                  cleanupIDs: false,
                  convertShapeToPath: false,
                  removeDimensions: true,
                  removeViewBox: false,
                  removeXMLNS: true,
                },
              ],
            },
          },
        },
        {
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
            outputPath: "static/images/",
            publicPath: "/_next/static/images/",
          },
        },
      ],
    });

    return config;
  },
});

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
