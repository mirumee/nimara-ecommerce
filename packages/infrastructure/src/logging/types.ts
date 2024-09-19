export type LogLevel =
  | "critical"
  | "error"
  | "warn"
  | "info"
  | "debug"
  | "notset";

export type LoggerFn = (message: string, args?: Record<any, any>) => void;

export type LoggerServiceConfig = {
  level: LogLevel;
  scrubKeys: string[];
};

export type LoggerService = {
  critical: LoggerFn;
  debug: LoggerFn;
  error: LoggerFn;
  info: LoggerFn;
  warn: LoggerFn;
};
