import { zValidator } from "@hono/zod-validator";

import { ValidationError } from "#root/hono/error/http";

type ZValidator = typeof zValidator;

/**
 * Throws our `ValidationError` instead of returning hono's default 400.
 */
export const zodValidatorMiddleware: ZValidator = ((
  target: Parameters<ZValidator>[0],
  schema: Parameters<ZValidator>[1],
  hook?: Parameters<ZValidator>[2],
  options?: Parameters<ZValidator>[3],
) => {
  if (hook) {
    return zValidator(target, schema, hook, options);
  }

  return zValidator(
    target,
    schema,
    (result) => {
      if (!result.success) {
        throw new ValidationError({
          context: target,
          cause: result.error,
        });
      }
    },
    options,
  );
}) as unknown as ZValidator;
