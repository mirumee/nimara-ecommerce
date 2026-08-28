import {
  z,
  type ZodSafeParseResult,
  type ZodSafeParseSuccess,
} from "zod";

import { type AnyZodSchema } from "./types";

/**
 * A variable left blank in a `.env` reads as unset. `SENTRY_DSN=` is how an
 * example file documents an optional variable, and it must not parse as an
 * empty URL or shadow a default.
 */
export const blankAsUnset = <Schema extends z.ZodType>(schema: Schema) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    schema,
  );

export const prepareConfig = <Schema extends AnyZodSchema = AnyZodSchema>({
  name = "",
  schema,
  input,
  serverOnly = false,
}: {
  input?: Partial<{ [Key in keyof z.infer<Schema>]: unknown }>;
  name?: string;
  schema: Schema;
  serverOnly?: boolean;
}): ZodSafeParseSuccess<Schema["_output"]>["data"] => {
  const parsedConfig = schema.safeParse({
    ...process.env,
    ...(input ?? {}),
  });

  if (serverOnly && typeof window !== "undefined") {
    return {} as ZodSafeParseResult<Schema["_output"]>["data"];
  }

  if (!parsedConfig.success) {
    const errors = parsedConfig.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`,
    );

    throw new Error(
      `Invalid ${name ? name + " " : ""}CONFIG\n\n${errors.join("\n")}`,
    );
  }

  return parsedConfig.data;
};
