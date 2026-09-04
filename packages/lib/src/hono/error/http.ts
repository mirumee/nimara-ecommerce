import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

import { type ResponseSchema, responseSchema } from "#root/api/schema";
import { isError } from "#root/error/utils";

type HttpErrorOptions = {
  cause?: unknown;
  context?: string;
  errors?: ResponseSchema["errors"];
  message?: string;
};

// Serialized with the same `responseSchema` the route handlers use.
export class HttpError extends HTTPException {
  public readonly context: string | undefined;
  public readonly errors: ResponseSchema["errors"];
  public readonly type: string;

  constructor(status: HTTPException["status"], options?: HttpErrorOptions) {
    super(status, { message: options?.message, cause: options?.cause });
    this.context = options?.context;
    this.errors = options?.errors ?? [];
    this.type = this.constructor.name;
  }

  serialize(): ResponseSchema {
    return responseSchema.parse({
      description: this.message,
      context: this.context ?? null,
      errors: this.errors,
    });
  }
}

export class BadRequestError extends HttpError {
  constructor(options?: HttpErrorOptions) {
    super(400, { message: "Bad request.", ...options });
  }
}

export class UnauthorizedError extends HttpError {
  constructor(options?: HttpErrorOptions) {
    super(401, { message: "Unauthorized.", ...options });
  }
}

export class UnauthorizedDomainError extends UnauthorizedError {
  constructor(options?: HttpErrorOptions) {
    super({ message: "Unauthorized domain.", ...options });
  }
}

export class ForbiddenError extends HttpError {
  constructor(options?: HttpErrorOptions) {
    super(403, { message: "Forbidden.", ...options });
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(options?: HttpErrorOptions) {
    super(422, { message: "Unprocessable entity.", ...options });
  }
}

export class ValidationError extends BadRequestError {
  constructor(options?: HttpErrorOptions) {
    super({ message: "Validation error.", ...options });
  }

  override serialize(): ResponseSchema {
    const errors = isError(this.cause, ZodError)
      ? this.cause.issues.map((issue) => ({
          code: issue.code.toUpperCase().replaceAll(" ", "_"),
          message: `${issue.path.join(".")}: ${issue.message}`,
        }))
      : this.errors;

    return responseSchema.parse({
      description: this.message,
      context: this.context ?? null,
      errors,
    });
  }
}
