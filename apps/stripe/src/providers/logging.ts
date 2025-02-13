import { loggingService } from "@nimara/infrastructure/logging/service";

// TODO: Add proper logging provider.
export const getLoggingProvider = () => loggingService;

export type Logger = typeof loggingService;
