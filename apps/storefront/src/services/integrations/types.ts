import type { Logger } from "@nimara/infrastructure/logging/types";

/**
 * A provider factory builds a fully configured service instance for one
 * integration (e.g. Algolia search, ButterCMS pages). The factory is async so
 * each provider can be `import()`-ed lazily — only the selected provider's
 * module is pulled into the server bundle.
 */
export type ProviderFactory<TService> = (logger: Logger) => Promise<TService>;

/**
 * A registry maps a provider id (the value of the selecting env var, e.g.
 * `SEARCH_PROVIDER=algolia`) to its factory. Adding a new provider means
 * adding one entry here — loaders and consumers stay untouched.
 */
export type ProviderRegistry<TService> = Record<
  string,
  ProviderFactory<TService>
>;

/**
 * Resolves which provider id should be used for a capability, or `null` to fall
 * back to the empty (zero-config) service. Reads from validated env.
 */
export type ProviderResolver<TRegistry extends ProviderRegistry<unknown>> =
  () => keyof TRegistry | null;
