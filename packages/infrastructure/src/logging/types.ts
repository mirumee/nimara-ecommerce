/**
 * Available log levels
 * - debug: Detailed information, typically of interest only when diagnosing problems.
 * - info: Confirmation that things are working as expected.
 * - warning: An indication that something unexpected happened, or indicative of some problem in the near future (e.g. ‘disk space low’). The software is still functioning as expected.
 * - error: Due to a more serious problem, the software has not been able to perform some function.
 * - critical: A serious error, indicating that the program itself may be unable to continue running.
 *
 * @see {@link LogFn} for the log function type.
 * @see {@link Logger} for the logger type.
 * @see {@link LoggerService} for the logger service type.
 */
export type LogLevel = "debug" | "info" | "warning" | "error" | "critical";

/**
 * Log function type. It takes a message and an optional context object.
 *
 * @see {@link LogLevel} for available log levels.
 * @see {@link Logger} for the logger type.
 * @see {@link LoggerService} for the logger service type.
 */
export type LogFn = (message: string, context?: object) => void;

/**
 * Type of the logger instance.
 * It contains methods for each log level.
 * Each method takes a message and an optional context object.
 *
 * @see {@link LogLevel} for available log levels.
 * @see {@link LogFn} for the log function type.
 */
export type Logger = Record<LogLevel, LogFn>;

/**
 * Logger service type. Any function that returns a logger instance should implement this type.
 *
 * @see {@link Logger} for the logger type.
 * @see {@link LogLevel} for available log levels.
 * @see {@link LogFn} for the log function type.
 */
export type LoggerService = (params: { level: LogLevel }) => Logger;
