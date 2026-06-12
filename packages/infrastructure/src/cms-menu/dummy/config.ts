import { type Logger } from "#root/logging/types";

import { type DummyCMSMenuServiceConfig } from "./types";

export const toDummyCMSMenuConfig = (
  _env: Record<string, string | undefined>,
  logger: Logger,
): DummyCMSMenuServiceConfig => ({ logger });
