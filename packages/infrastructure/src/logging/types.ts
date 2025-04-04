/**
 * Available log levels
 * - debug: Detailed information, typically of interest only when diagnosing problems.
 * - info: Confirmation that things are working as expected.
 * - warning: An indication that something unexpected happened, or indicative of some problem in the near future (e.g. ‘disk space low’). The software is still functioning as expected.
 * - error: Due to a more serious problem, the software has not been able to perform some function.
 * - critical: A serious error, indicating that the program itself may be unable to continue running.
 */
export type LogLevel = "debug" | "info" | "warning" | "error" | "critical";

export type LogFn = (message: string, context?: object) => void;
export type Logger = Record<LogLevel, LogFn>;

export type LoggerService = ({ level }: { level: LogLevel }) => Logger;
