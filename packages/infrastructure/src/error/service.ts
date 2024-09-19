export type ErrorService<TContext> = {
  logError: (error: unknown, context?: TContext) => string;
};
