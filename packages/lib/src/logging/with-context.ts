import { type LogFn, type Logger } from "@nimara/infrastructure/logging/types";

// Listed level by level, so a new level cannot silently lose the context.
export const withLogContext = ({
  context,
  logger,
}: {
  context: object;
  logger: Logger;
}): Logger => {
  const bind =
    (level: keyof Logger): LogFn =>
    (message, extra) =>
      logger[level](message, { ...context, ...extra });

  return {
    critical: bind("critical"),
    debug: bind("debug"),
    error: bind("error"),
    info: bind("info"),
    warning: bind("warning"),
  };
};
