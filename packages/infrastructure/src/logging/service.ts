import pino, { type LoggerOptions } from "pino";

export type LoggerLevel = "debug" | "info" | "warning" | "error" | "critical";

export type LogFn = (message: string, context?: object) => void;
export type LoggerService = ({
  level,
}: {
  level: LoggerLevel;
}) => Record<LoggerLevel, LogFn>;

const devTransport: pino.DestinationStream = {
  write(msg) {
    console.log(JSON.parse(msg));
  },
};
const isDevelopment =
  process.env.NODE_ENV === "development" && typeof window === "undefined";

const getPinoLogger = (options: LoggerOptions) =>
  pino(
    {
      name: "storefront",
      browser: {
        asObject: true,
      },
      formatters: {
        level: (label) => ({ level: label.toUpperCase() }),
      },
      timestamp: () => `,"time":"${new Date().toISOString()}"`,
      messageKey: "message",
      redact: { paths: ["hostname", "pid"], remove: true },
      ...options,
      level: "debug",
    },
    isDevelopment ? devTransport : undefined,
  );

const pinoLoggerService: LoggerService = (opts: LoggerOptions) => ({
  debug: (message, context) =>
    getPinoLogger(opts).debug({ message, ...context }),
  info: (message, context) => getPinoLogger(opts).info({ message, ...context }),
  warning: (message, context) =>
    getPinoLogger(opts).warn({ message, ...context }),
  error: (message, context) =>
    getPinoLogger(opts).error({ message, ...context }),
  critical: (message, context) =>
    getPinoLogger(opts).fatal({ message, ...context }),
});

// I put it here, not in storefront, as it's used a lot in the infrastructure package
export const loggingService = pinoLoggerService({
  level: (process.env.LOG_LEVEL as LoggerLevel) || "info",
});

export const getLoggingService = (
  opts?: Partial<Omit<LoggerOptions, "level">>,
) =>
  pinoLoggerService({
    level: (process.env.LOG_LEVEL || "info") as LoggerLevel,
    ...opts,
  });
