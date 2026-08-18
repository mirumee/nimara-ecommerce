import type { NewsletterProviderId } from "@nimara/infrastructure/newsletter/select";
import type { CMSProviderId } from "@nimara/infrastructure/providers/cms";
import type { SearchProviderId } from "@nimara/infrastructure/search/select";

import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";
import { isSaleorConfigured } from "@/services/utils/empty-services";

/**
 * Shared build-time selection policy. When Saleor is the selected provider but
 * unconfigured, serve dummy data out of the box — except in production, where
 * we fall back to the empty service (null) so demo data never leaks into a live
 * deployment. Any explicitly selected provider is returned as-is.
 */
const withSaleorFallback = <TId extends string>(
  provider: TId,
): TId | "dummy" | null => {
  if (provider === "saleor" && !isSaleorConfigured) {
    return clientEnvs.ENVIRONMENT === "PRODUCTION" ? null : "dummy";
  }

  return provider;
};

export const resolveSearchProvider = (): SearchProviderId | null =>
  withSaleorFallback(serverEnvs.SEARCH_SERVICE);

export const resolveCMSProvider = (): CMSProviderId | null =>
  withSaleorFallback(serverEnvs.CMS_SERVICE);

/**
 * No Saleor fallback and no default: `null` here means the capability is off,
 * and the home page omits the newsletter form entirely. This must stay a
 * configuration read — resolving it from a provider health check would put a
 * provider round-trip in the home page's critical path and let the provider's
 * uptime decide whether the form exists.
 */
export const resolveNewsletterProvider = (): NewsletterProviderId | null =>
  serverEnvs.NEWSLETTER_SERVICE ?? null;
