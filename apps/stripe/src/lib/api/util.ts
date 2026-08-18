import { type BaseError } from "@nimara/domain/objects/Error";

import {
  type IntRange,
  type PartialOnly,
  type RequiredOnly,
} from "@/lib/types";

import { type ResponseSchema, responseSchema } from "./schema";

export const responseSuccess = ({
  status = 200,
  ...response
}: {
  status?: IntRange<200, 299>;
} & RequiredOnly<ResponseSchema, "description">) =>
  Response.json(responseSchema.parse(response), { status });

export const responseError = ({
  status = 400,
  ...response
}: {
  status?: IntRange<400, 599>;
} & PartialOnly<ResponseSchema, "context">) =>
  Response.json(responseSchema.parse(response), { status });

/**
 * Maps `Result` errors (domain `BaseError[]`) to a uniform error response.
 */
export const responseFromErrors = (errors: readonly BaseError[]) => {
  const [first] = errors;
  const description =
    (first?.context?.description as string | undefined) ??
    first?.message ??
    "Request failed.";

  return responseError({
    description,
    errors: errors.map((error) => ({
      message: error.message ?? error.code,
      code: error.code,
    })),
    status: (first?.status ?? 400) as IntRange<400, 599>,
  });
};
