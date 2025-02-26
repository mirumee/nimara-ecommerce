import pino, { type LoggerOptions } from "pino";

export type LoggerLevel = "debug" | "info" | "warning" | "error" | "critical";

export type LogFn = (message: string, context?: object) => void;

export type LoggerService = ({
  level,
}: {
  level: LoggerLevel;
}) => Record<LoggerLevel, LogFn>;

const getPinoLogger = (options: LoggerOptions) =>
  pino({
    name: "storefront",
    browser: {
      asObject: true,
      formatters: {
        level: (label) => ({ level: label }),
      },
    },
    messageKey: "message",
    formatters: {
      level: (label) => ({ level: label }),
    },
    redact: { paths: ["hostname", "pid"], remove: true },
    ...options,
  });

const pinoLoggerService: LoggerService = ({ level }) => ({
  debug: (message, context) => getPinoLogger({ level }).debug(message, context),
  info: (message, context) => getPinoLogger({ level }).info(message, context),
  warning: (message, context) =>
    getPinoLogger({ level }).warn(message, context),
  error: (message, context) => getPinoLogger({ level }).error(context, message),
  critical: (message, context) =>
    getPinoLogger({ level }).fatal(message, context),
});

// I put it here, not in storefront, as it's used a lot in the infrastructure package
export const loggingService = pinoLoggerService({
  level: (process.env.LOG_LEVEL as LoggerLevel) || "info",
});
