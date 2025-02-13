export type WebhookData<T extends { event: unknown }> = NonNullable<T["event"]>;
