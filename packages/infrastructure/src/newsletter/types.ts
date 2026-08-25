import { type Logger } from "#root/logging/types";

export type KlaviyoNewsletterServiceConfig = {
  /** Klaviyo list ID. The list must have double opt-in enabled. */
  listId: string;
  logger: Logger;
  privateApiKey: string;
  timeoutMs: number;
};
