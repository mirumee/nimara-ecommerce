import {
  createServiceSelector,
  type ProviderManifest,
} from "#root/lib/create-service-selector";
import { type NewsletterService } from "#root/use-cases/newsletter/types";

import {
  brevoNewsletterEnvSchema,
  toBrevoNewsletterConfig,
} from "./brevo/config";
import { toDummyNewsletterConfig } from "./dummy/config";

/**
 * Provider manifests for newsletter subscription. Unlike search and content
 * selection, this capability has NO default provider: Nimara cannot pick an
 * email service provider on an adopter's behalf, and an unset `NEWSLETTER_SERVICE`
 * is the capability's off state rather than a fallback. Adding a default here
 * would turn that off state into one and put the form back on the home page.
 */
const MANIFESTS = [
  {
    id: "brevo",
    configSchema: brevoNewsletterEnvSchema,
    create: async ({ env, logger }) => {
      const { brevoNewsletterService } = await import("./providers");

      return brevoNewsletterService(toBrevoNewsletterConfig(env, logger));
    },
  },
  {
    id: "dummy",
    create: async ({ env, logger }) => {
      const { dummyNewsletterService } = await import("./providers");

      return dummyNewsletterService(toDummyNewsletterConfig(env, logger));
    },
  },
] as const satisfies readonly ProviderManifest<NewsletterService, string>[];

const selector = createServiceSelector(MANIFESTS);

export const createNewsletterService = selector.create;
export const NEWSLETTER_PROVIDER_IDS = selector.ids;
export const newsletterProviders = selector.providers;
export type NewsletterProviderId = (typeof NEWSLETTER_PROVIDER_IDS)[number];
