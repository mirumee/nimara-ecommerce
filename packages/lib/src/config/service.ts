import { basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import { baseConfigSchema, type PackageInfo } from "#root/config/schema";
import { type AnyZodSchema } from "#root/zod/types";
import { prepareConfig } from "#root/zod/util";

type ServiceConfigInput<Schema extends AnyZodSchema> = {
  // Pass `import.meta.url`; `SERVICE` is the directory it sits in.
  moduleUrl: string;
  pkg: PackageInfo;
  schema?: Schema;
};

const prepareForService = <Schema extends AnyZodSchema>(
  {
    moduleUrl,
    pkg,
    // Intersecting an empty object is a no-op, for a service that adds nothing.
    schema = z.object({}) as unknown as Schema,
  }: ServiceConfigInput<Schema>,
  { singleTenant }: { singleTenant: boolean },
) => {
  const service = basename(dirname(fileURLToPath(moduleUrl)));

  return prepareConfig({
    name: service,
    serverOnly: true,
    schema: z
      .object({ SERVICE: z.string().default(service) })
      .and(baseConfigSchema(pkg, { singleTenant }))
      .and(schema),
  });
};

export const prepareServiceConfig = <
  Schema extends AnyZodSchema = AnyZodSchema,
>(
  input: ServiceConfigInput<Schema>,
) => prepareForService(input, { singleTenant: false });

/**
 * For an app that serves exactly one Saleor: `ALLOWED_DOMAINS` holds one
 * concrete domain and comes back as `SALEOR_DOMAIN`, for work with no request
 * to read a tenant from — a cron, a queue consumer, anything at startup.
 *
 * Serving more than one means dropping this call, and `SALEOR_DOMAIN` goes
 * with it, so the compiler names every caller that assumed one.
 */
export const prepareSingleTenantServiceConfig = <
  Schema extends AnyZodSchema = AnyZodSchema,
>(
  input: ServiceConfigInput<Schema>,
) => {
  const config = prepareForService(input, { singleTenant: true });
  const [saleorDomain] = config.ALLOWED_DOMAINS as [string];

  return { ...config, SALEOR_DOMAIN: saleorDomain };
};
