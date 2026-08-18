import * as Sentry from "@sentry/node";

export const initSentry = ({
  dsn,
  environment,
  release,
}: {
  dsn?: string;
  environment: string;
  release: string;
}) => {
  Sentry.init({
    dsn,
    environment,
    release,
    enabled: !!dsn,
    normalizeDepth: 10,
  });
};

export const captureException = Sentry.captureException;
