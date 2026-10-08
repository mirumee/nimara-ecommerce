import type { Logger } from "@nimara/infrastructure/logging/types";
import { createNewsletterService } from "@nimara/infrastructure/newsletter/select";

import { resolveNewsletterProvider } from "@/services/integrations/resolve";
import { createServiceLoader } from "@/services/utils/create-loader";

import { emptyNewsletterService } from "../utils/empty-services";

export const createNewsletterServiceLoader = (logger: Logger) =>
  createServiceLoader({
    capability: "newsletter",
    resolve: resolveNewsletterProvider,
    build: (provider, log) =>
      createNewsletterService(provider, { env: process.env, logger: log }),
    emptyService: emptyNewsletterService,
    logger,
  });
