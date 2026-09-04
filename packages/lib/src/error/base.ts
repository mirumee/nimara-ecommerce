interface BaseErrorOptions {
  cause?: { source?: Error } & Record<string, unknown>;
}

export class BaseError extends Error {
  constructor(message?: string, options?: BaseErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BaseError);
    }
  }
}

export class BaseAggregateError extends AggregateError {
  constructor(errors: Iterable<any>, message?: string) {
    super(errors, message);
    this.name = this.constructor.name;
  }
}
