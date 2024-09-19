const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
const enabled = dsn !== "";
const debug = process.env.SENTRY_DEBUG === "true";

export const isProduction = environment === "PRODUCTION";

export const sentryCommonConfig = {
  dsn,
  enabled,
  environment,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug,

  sampleRate: isProduction ? 0.25 : 1.0,

  tunnelRoute: "/monitoring",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: isProduction ? 0.25 : 1.0,

  release: process.env.APP_SEMVER_NAME,
};
