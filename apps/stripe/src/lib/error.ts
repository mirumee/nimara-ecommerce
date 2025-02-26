type ErrorWithType<T extends Error = Error> = T & { type?: string };

export const isError = <T extends Error>(
  err: unknown,
  of?: new (...args: any[]) => T,
): err is ErrorWithType<T> => {
  if (of) {
    return err instanceof of;
  }

  return err instanceof Error;
};
