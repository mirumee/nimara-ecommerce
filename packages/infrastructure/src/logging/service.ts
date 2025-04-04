import { type LoggerOptions } from "pino";

import { pinoLogger } from "./pino";
import { type Logger, type LogLevel } from "./types";

const LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

export const getLogger = (
  opts?: Partial<Omit<LoggerOptions<LogLevel, true>, "level">>,
): Logger =>
  pinoLogger({
    level: LOG_LEVEL,
    name: "storefront",
    ...opts,
  });

export const logger: Logger = getLogger();
