import pino, { type LoggerOptions } from "pino";
import { inspect } from "util";

import {
  type LoggerService,
  type LoggingService,
  type LogLevel,
} from "./types";

const IS_DEVELOPMENT =
  process.env.NODE_ENV === "development" && typeof window === "undefined";

const devStream: pino.DestinationStream = {
  write(msg) {
    console.log(
      inspect(JSON.parse(msg), {
        colors: true,
        depth: Infinity,
        showHidden: true,
      }),
    );
  },
};

export const pinoLoggerService: LoggerService = (
  opts: LoggerOptions<LogLevel>,
  stream?: pino.DestinationStream,
): LoggingService => {
  const logger = pino<LogLevel>(
    {
      browser: {
        asObject: true,
        write: {
          error: console.error,
          info: console.info,
          warn: console.warn,
          debug: console.debug,
          fatal: console.error,
          trace: console.trace,
        },
        formatters: {
          level: (label) => ({ level: label.toUpperCase() }),
        },
      },
      formatters: {
        level: (label) => ({ level: label.toUpperCase() }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      messageKey: "message",
      redact: { paths: ["hostname", "pid"], remove: true },
      ...opts,
    },
    IS_DEVELOPMENT ? devStream : stream,
  );

  return {
    debug: (message, context) => logger.debug({ message, ...context }),
    info: (message, context) => logger.info({ message, ...context }),
    warning: (message, context) => logger.warn({ message, ...context }),
    error: (message, context) => console.error({ message, ...context }),
    critical: (message, context) => logger.fatal({ message, ...context }),
  };
};
