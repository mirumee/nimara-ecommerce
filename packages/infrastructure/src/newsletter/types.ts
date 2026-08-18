import { type Logger } from "#root/logging/types";

export type BrevoNewsletterServiceConfig = {
  apiKey: string;
  listIds: number[];
  logger: Logger;
  redirectUrl: string;
  /**
   * Keyed by locale with a mandatory `default`. Brevo picks the confirmation
   * email by template id, so this is where the locale crossing the boundary is
   * spent.
   */
  templateIds: Record<string, number> & { default: number };
  timeoutMs: number;
};
