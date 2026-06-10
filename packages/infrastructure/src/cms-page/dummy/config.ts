import { type Logger } from "#root/logging/types";

import { type DummyCMSPageServiceConfig } from "./types";

export const toDummyCMSPageConfig = (
  _env: Record<string, string | undefined>,
  logger: Logger,
): DummyCMSPageServiceConfig => ({ logger });
