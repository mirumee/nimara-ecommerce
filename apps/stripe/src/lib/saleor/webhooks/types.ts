export type WebhookData<T extends { event: unknown } = { event: unknown }> =
  NonNullable<T["event"]>;
