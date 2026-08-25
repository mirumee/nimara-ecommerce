type ErrorConstructor<T = Error> = new (...args: any[]) => T;

// Without `of`, any `Error` matches.
export const isError = <T extends Error>(
  error: unknown,
  of?: ErrorConstructor<T> | ErrorConstructor<T>[],
): error is T => {
  if (!(error instanceof Error)) {
    return false;
  }

  if (!of) {
    return true;
  }

  return Array.isArray(of)
    ? of.some((ErrorClass) => error instanceof ErrorClass)
    : error instanceof of;
};

/**
 * Narrows to the errors a caller knows how to handle and rethrows the rest, so
 * a `catch` swallows nothing it did not name.
 */
export const expectError = <T extends Error>(
  error: unknown,
  of: ErrorConstructor<T> | ErrorConstructor<T>[],
): error is T => {
  if (!isError(error, of)) {
    throw error;
  }

  return true;
};

type SerializedError = {
  cause?: unknown;
  message: string;
  name: string;
  stack?: string;
};

// `Error` has no enumerable properties, so JSON.stringify writes `{}`.
export const serializeError = (error: unknown): SerializedError =>
  error instanceof Error
    ? {
        cause:
          error.cause instanceof Error
            ? serializeError(error.cause)
            : error.cause,
        message: error.message,
        name: error.name,
        stack: error.stack,
      }
    : { message: String(error), name: typeof error };
