import type {
  CMSProviderId,
  SearchProviderId,
} from "@nimara/infrastructure/providers-catalog";

import { clientEnvs } from "@/envs/client";
import { isSaleorConfigured } from "@/services/lazy-loaders/empty-services";

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
  withSaleorFallback(clientEnvs.SEARCH_SERVICE);

export const resolveCMSProvider = (): CMSProviderId | null =>
  withSaleorFallback(clientEnvs.CMS_SERVICE);
