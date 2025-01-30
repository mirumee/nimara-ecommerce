import type { SafeParseSuccess, z } from "zod";

import { type AnyZodSchema } from "./types";

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
}): SafeParseSuccess<Schema["_output"]>["data"] => {
  const parsedConfig = schema.safeParse({
    ...process.env,
    ...(input ?? {}),
  });

  if (serverOnly && typeof window !== "undefined") {
    return {} as SafeParseSuccess<Schema["_output"]>["data"];
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
