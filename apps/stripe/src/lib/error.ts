type ErrorWithType<T extends Error = Error> = T & { type?: string };

export const isError = <T extends Error>(
  err: unknown,
): err is ErrorWithType<T> => err instanceof Error;
