import {
  getLoggingService,
  type loggingService,
} from "@nimara/infrastructure/logging/service";

export const getLoggingProvider = () => getLoggingService({ name: "stripe" });

export type Logger = typeof loggingService;
