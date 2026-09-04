import {
  createServiceSelector,
  type ProviderManifest,
} from "#root/lib/create-service-selector";
import { type NewsletterService } from "#root/use-cases/newsletter/types";

import {
  klaviyoNewsletterEnvSchema,
  toKlaviyoNewsletterConfig,
} from "./klaviyo/config";

const MANIFESTS = [
  {
    id: "klaviyo",
    configSchema: klaviyoNewsletterEnvSchema,
    create: async ({ env, logger }) => {
      const { klaviyoNewsletterService } = await import("./klaviyo/provider");

      return klaviyoNewsletterService(toKlaviyoNewsletterConfig(env, logger));
    },
  },
] as const satisfies readonly ProviderManifest<NewsletterService, string>[];

const selector = createServiceSelector(MANIFESTS);

export const createNewsletterService = selector.create;
export const NEWSLETTER_PROVIDER_IDS = selector.ids;
export const newsletterProviders = selector.providers;
export type NewsletterProviderId = (typeof NEWSLETTER_PROVIDER_IDS)[number];
