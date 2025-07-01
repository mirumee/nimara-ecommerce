import { type LoggerOptions } from "pino";

import { pinoLogger } from "./pino";
import { type Logger, type LogLevel } from "./types";

const LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "debug";

/**
 * Use this function to create a logger instance.
 * It uses a default logger config, but you can override it by passing a config object.
 * A `name` property is required in the config object.
 *
 * @see {@link Logger} for the logger type.
 * @see {@link LogLevel} for available log levels.
 * @see {@link LoggerOptions} for available logger options.
 *
 * @example
 * import { getLogger } from "@nimara/infrastructure/logging/service";
 * const logger = getLogger({ name: "my-app" });
 * logger.info("Hello world");
 * logger.error("Something went wrong");
 */
export const getLogger = (
  opts: Omit<LoggerOptions<LogLevel>, "level">,
): Logger =>
  pinoLogger({
    level: LOG_LEVEL,
    ...opts,
  });

/**
 * Default logger instance.
 * This instance is used by default in the application.
 * You can override this instance by creating a new logger instance with the `getLogger` function.
 *
 * @see {@link Logger} for the logger type.
 * @see {@link LogLevel} for available log levels.
 * @see {@link LoggerOptions} for available logger options.
 *
 * @example
 * import { logger } from "@nimara/infrastructure/logging/service";
 * logger.info("Hello world");
 * logger.error("Something went wrong");
 */
export const logger: Logger = getLogger({ name: "storefront" });
