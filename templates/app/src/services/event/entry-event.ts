import { initSentry } from "@nimara/lib/reporting/sentry/instrument";

import { container } from "@/services/event/container";

const { config, logger } = container.items;

initSentry({
  dsn: config.SENTRY_DSN,
  environment: config.ENVIRONMENT,
  release: config.RELEASE,
});

export type InvocationContext = {
  getRemainingTimeInMillis: () => number;
};

export const handler = async (
  event: unknown,
  invocation: InvocationContext,
): Promise<void> => {
  logger.info("Invoked", {
    remainingMs: invocation.getRemainingTimeInMillis(),
  });

  void event;
};
