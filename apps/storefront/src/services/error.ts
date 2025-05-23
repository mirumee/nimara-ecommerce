import * as Sentry from "@sentry/nextjs";

import type { ErrorService } from "@nimara/infrastructure/error/service";

type Context = Parameters<typeof Sentry.captureException>[1];

export const errorService: ErrorService<Context> = {
  logError: (error, context): string => {
    return Sentry.captureException(error, context);
  },
};
