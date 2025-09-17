import { type Logger } from "@nimara/infrastructure/logging/types";

let loggerInstance: Logger | null = null;

/**
 * Lazy loads the storefront logger and ensures only one instance is created (singleton).
 * @returns The storefront logger instance.
 */
export const getStorefrontLogger = async (): Promise<Logger> => {
  if (loggerInstance) {
    return loggerInstance;
  }

  const { getLogger } = await import("@nimara/infrastructure/logging/service");

  loggerInstance = getLogger({ name: "storefront" });

  return loggerInstance;
};
