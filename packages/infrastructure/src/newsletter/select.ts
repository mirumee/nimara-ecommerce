import {
  createServiceSelector,
  type ProviderManifest,
} from "#root/lib/create-service-selector";
import { type NewsletterService } from "#root/use-cases/newsletter/types";

import {
  klaviyoNewsletterEnvSchema,
  toKlaviyoNewsletterConfig,
} from "./klaviyo/config";

/**
 * Provider manifests for newsletter capture, in the same shape as the search
 * manifests. The provider-id catalog ({@link NEWSLETTER_PROVIDER_IDS}) and the
 * {@link newsletterProviders} describe-list are derived from this array, so a
 * second provider is one entry and no caller changes.
 *
 * Unlike search and CMS there is no `saleor` entry and no default: the commerce
 * backend has no newsletter capability, so an unselected deployment has no
 * provider at all.
 */
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
