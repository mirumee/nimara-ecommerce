import { type ErrorHandler } from "hono";

import { responseSchema } from "#root/api/schema";
import { isError, serializeError } from "#root/error/utils";
import { HttpError } from "#root/hono/error/http";
import { captureException } from "#root/reporting/sentry/instrument";

export const errorHandler: ErrorHandler = (error, context) => {
  const logger = context.get("logger");
  const serializedError = serializeError(error);

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
