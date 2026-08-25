import { z } from "zod";

import { isSsr } from "@nimara/infrastructure/config";
import { NEWSLETTER_PROVIDER_IDS } from "@nimara/infrastructure/newsletter/select";
import { CMS_PROVIDER_IDS } from "@nimara/infrastructure/providers/cms";
import { SEARCH_PROVIDER_IDS } from "@nimara/infrastructure/search/select";

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim().length === 0 ? undefined : value;

const schema = z.object({
  // Saleor envs
  SALEOR_APP_TOKEN: z.string().optional(),

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
  // No default: the commerce backend has no newsletter capability, so an absent
  // value means no provider rather than a fallback.
  NEWSLETTER_SERVICE: z.preprocess(
    emptyStringToUndefined,
    z.enum(NEWSLETTER_PROVIDER_IDS).optional(),
  ),
});

type Schema = z.infer<typeof schema>;

export const serverEnvs = isSsr
  ? schema.parse({
      SALEOR_APP_TOKEN: process.env.SALEOR_APP_TOKEN,
      SEARCH_SERVICE: process.env.SEARCH_SERVICE,
      CMS_SERVICE: process.env.CMS_SERVICE,
      NEWSLETTER_SERVICE: process.env.NEWSLETTER_SERVICE,
    })
  : ({} as Schema);
