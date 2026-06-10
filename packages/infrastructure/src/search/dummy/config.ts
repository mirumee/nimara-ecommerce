import { type Logger } from "#root/logging/types";

import { type DummySearchServiceConfig } from "./types";

export const toDummySearchConfig = (
  _env: Record<string, string | undefined>,
  logger: Logger,
): DummySearchServiceConfig => ({ logger });
