import { withSentryConfig } from "@sentry/nextjs";
import { type NextConfig } from "next";

const APP_SEMVER_NAME = `${process.env.npm_package_name}@${process.env.npm_package_version}`;
const isSentryAvailable =
  process.env.SENTRY_AUTH_TOKEN &&
  process.env.SENTRY_PROJECT &&
  process.env.SENTRY_ORG;

const nextConfig: NextConfig = {
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

  reactStrictMode: true,
  transpilePackages: ["@nimara/ui"],

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [{ module: /opentelemetry/ }];
    }

    return config;
  },
};

const configWithSentry = withSentryConfig(nextConfig, {
  silent: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  release: {
    name: APP_SEMVER_NAME,
    deploy: {
      env: process.env.NEXT_PUBLIC_ENVIRONMENT!,
    },
  },
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});

export default isSentryAvailable ? configWithSentry : nextConfig;
