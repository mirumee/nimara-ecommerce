import { z } from "zod";

import { CMS_PROVIDER_IDS } from "@nimara/infrastructure/cms-page/select";
import { isSsr } from "@nimara/infrastructure/config";
import { SEARCH_PROVIDER_IDS } from "@nimara/infrastructure/search/select";

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim().length === 0 ? undefined : value;

const schema = z.object({
  // Saleor envs
  SALEOR_APP_TOKEN: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),

  // Integration selection (build-time, server-side). The allowed values are
  // derived from each capability's provider manifests.
  SEARCH_SERVICE: z.preprocess(
    emptyStringToUndefined,
    z.enum(SEARCH_PROVIDER_IDS).default("saleor"),
  ),
  CMS_SERVICE: z.preprocess(
    emptyStringToUndefined,
    z.enum(CMS_PROVIDER_IDS).default("saleor"),
  ),
});

type Schema = z.infer<typeof schema>;

export const serverEnvs = isSsr
  ? schema.parse({
      // Czy saleor powinien byc default?
      SALEOR_APP_TOKEN: process.env.SALEOR_APP_TOKEN,
      // Czy stripe powinien byc default?
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      SEARCH_SERVICE: process.env.SEARCH_SERVICE,
      CMS_SERVICE: process.env.CMS_SERVICE,
    })
  : ({} as Schema);
