import type { Logger } from "@nimara/infrastructure/logging/types";
import { createNewsletterService } from "@nimara/infrastructure/newsletter/select";

import { resolveNewsletterProvider } from "@/services/integrations/resolve";
import { createServiceLoader } from "@/services/utils/create-loader";

import { emptyNewsletterService } from "../utils/empty-services";

/**
 * Creates a lazy loader for the newsletter service. The storefront only selects
 * the provider (via env) and forwards the env record — the provider catalog,
 * wiring and per-provider config contracts live in
 * `@nimara/infrastructure/newsletter/select`.
 * This function is only used by the service registry.
 * @internal
 */
export const createNewsletterServiceLoader = (logger: Logger) =>
  createServiceLoader({
    resolve: resolveNewsletterProvider,
    build: (provider, log) =>
      createNewsletterService(provider, { env: process.env, logger: log }),
    emptyService: emptyNewsletterService,
    logger,
  });
