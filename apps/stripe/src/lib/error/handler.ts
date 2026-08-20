import { type ErrorHandler } from "hono";

import { responseSchema } from "@/lib/api/schema";
import { isError } from "@/lib/error";
import { HttpError } from "@/lib/error/http";
import { captureException } from "@/lib/sentry/instrument";

export const errorHandler: ErrorHandler = (error, context) => {
  const logger = context.get("logger");
  const serializedError = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    cause: error.cause,
  };

  if (isError(error, HttpError)) {
    logger?.debug("Http error caught.", serializedError);

    return context.json(error.serialize(), error.status);
  }

  logger?.error("Unhandled error.", serializedError);
  captureException(error);

  return context.json(
    responseSchema.parse({
      description: "Internal server error.",
      errors: [],
    }),
    500,
  );
};
