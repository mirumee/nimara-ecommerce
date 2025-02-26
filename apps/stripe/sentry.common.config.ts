const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
const enabled = dsn !== "";
const debug = process.env.SENTRY_DEBUG === "true";

export const isProduction = environment === "PRODUCTION";

export const sentryCommonConfig = {
  dsn,
  enabled,
  environment,
  debug,
  sampleRate: isProduction ? 0.25 : 1.0,
  tunnelRoute: "/monitoring",
  tracesSampleRate: isProduction ? 0.25 : 1.0,
  release: process.env.APP_SEMVER_NAME,
};
