import { type IntRange, type RequiredOnly } from "@/lib/types";

import { type ResponseSchema, responseSchema } from "./schema";

export const ResponseSuccess = ({
  status = 200,
  ...response
}: {
  status?: IntRange<200, 299>;
} & RequiredOnly<ResponseSchema, "description">) =>
  Response.json(responseSchema.parse(response), { status });

export const ResponseError = ({
  status = 400,
  ...response
}: {
  status?: IntRange<400, 599>;
} & ResponseSchema) =>
  Response.json(responseSchema.parse(response), { status });
