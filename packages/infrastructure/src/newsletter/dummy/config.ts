import { type Logger } from "#root/logging/types";

import { type DummyNewsletterServiceConfig } from "./types";

export const toDummyNewsletterConfig = (
  _env: Record<string, string | undefined>,
  logger: Logger,
): DummyNewsletterServiceConfig => ({ logger });
