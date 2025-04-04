import { type LoggerOptions } from "pino";

import { pinoLoggerService } from "./pino";
import { type LoggingService, type LogLevel } from "./types";

const LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

export const getLoggingService = (
  opts?: Partial<Omit<LoggerOptions<LogLevel, true>, "level">>,
): LoggingService =>
  pinoLoggerService({
    level: LOG_LEVEL,
    name: "storefront",
    ...opts,
  });

export const loggingService: LoggingService = getLoggingService();
