type ErrorWithType = Error & { type?: string };

export const isError = (err: unknown): err is ErrorWithType =>
  err instanceof Error;

export const isErrorOfType = <T extends ErrorWithType>(
  err: unknown,
  type: string,
): err is T => isError(err) && err.type === type;
