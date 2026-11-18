import { type Logger } from "#root/logging/types";

export type KlaviyoNewsletterServiceConfig = {
  listId: string;
  logger: Logger;
  privateApiKey: string;
  timeoutMs: number;
};
