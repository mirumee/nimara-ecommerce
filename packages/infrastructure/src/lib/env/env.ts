import { type z } from "zod";

/**
 * Parses `process.env` against a schema and returns the typed result, throwing
 * a clear error naming the missing/invalid keys.
 * Providers own their own env (Vercel, AWS, …) by passing their schema here.
 */
export const readEnv = <Schema extends z.ZodType>({
  schema,
  name = "environment",
}: {
  name?: string;
  schema: Schema;
}): z.infer<Schema> => {
  const parsed = schema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues.map(
      (issue) => `${issue.path.join(".")} (${issue.message})`,
    );

    throw new Error(`Invalid ${name} env: ${issues.join(", ")}.`);
  }

  return parsed.data;
};
