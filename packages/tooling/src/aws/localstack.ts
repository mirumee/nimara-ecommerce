export type BootstrapLogger = {
  error: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  warning: (message: string, meta?: Record<string, unknown>) => void;
};

const inFlight = new Map<string, Promise<unknown>>();

export const ensureLocalstackRuntime = async <T>(
  logger: BootstrapLogger,
  key: string,
  callback: () => T | PromiseLike<T>,
): Promise<T | undefined> => {
  const existing = inFlight.get(key);

  if (existing) {
    return existing as Promise<T | undefined>;
  }

  const operation = (async () => {
    try {
      return await callback();
    } catch (cause) {
      if (
        cause instanceof Error &&
        "code" in cause &&
        cause.code === "ECONNREFUSED"
      ) {
        logger.warning("LocalStack is unavailable.", {
          cause,
          endpoint: process.env.AWS_ENDPOINT_URL,
        });

        return undefined;
      }

      throw cause;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, operation);

  return operation;
};
