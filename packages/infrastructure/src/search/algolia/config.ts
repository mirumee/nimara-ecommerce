import { z } from "zod";

import { type Logger } from "#root/logging/types";

import { type AlgoliaSearchServiceConfig } from "./types";

const facetType = z.enum([
  "BOOLEAN",
  "DATE",
  "DATE_TIME",
  "DROPDOWN",
  "FILE",
  "MULTISELECT",
  "NUMERIC",
  "PLAIN_TEXT",
  "REFERENCE",
  "RICH_TEXT",
  "SWATCH",
]);

const availableFacetSchema = z.object({
  messageKey: z.string().optional(),
  name: z.string().optional(),
  slug: z.string(),
  type: facetType,
});

const virtualReplicaSchema = z.object({
  indexName: z.string(),
  messageKey: z.string(),
  queryParamValue: z.string(),
});

const indexSettingsSchema = z.object({
  availableFacets: z.record(z.string(), availableFacetSchema),
  channel: z.string(),
  currency: z.string().optional(),
  entity: z.string().optional(),
  indexName: z.string(),
  languageCode: z.string().optional(),
  virtualReplicas: z.array(virtualReplicaSchema),
});

const indicesSchema = z
  .array(indexSettingsSchema)
  .min(1, "At least one Algolia index must be configured.");

export const algoliaSearchEnvSchema = z.object({
  SEARCH_ALGOLIA_API_KEY: z.string().min(1),
  SEARCH_ALGOLIA_APP_ID: z.string().min(1),
  SEARCH_ALGOLIA_INDICES: z
    .string()
    .transform((value, ctx) => {
      try {
        return JSON.parse(value) as unknown;
      } catch {
        ctx.addIssue({
          code: "custom",
          message: "SEARCH_ALGOLIA_INDICES must be valid JSON.",
        });

        return z.NEVER;
      }
    })
    .pipe(indicesSchema),
});

export const toAlgoliaSearchConfig = (
  env: Record<string, string | undefined>,
  logger: Logger,
): AlgoliaSearchServiceConfig => {
  const parsed = algoliaSearchEnvSchema.parse(env);

  return {
    credentials: {
      appId: parsed.SEARCH_ALGOLIA_APP_ID,
      apiKey: parsed.SEARCH_ALGOLIA_API_KEY,
    },
    settings: { indices: parsed.SEARCH_ALGOLIA_INDICES },
    logger,
  };
};
