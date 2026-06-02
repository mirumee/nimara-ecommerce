/**
 * Generic provider-selection helper shared by swappable capabilities
 * (search, CMS page, CMS menu, …).
 *
 * Each capability supplies a registry mapping every provider id to an async
 * builder that returns the configured service — or `null` when the selected
 * provider's config section is absent. Keying the registry by the capability's
 * id union makes a missing provider a compile error, and the literal `import()`
 * inside each builder keeps every provider in its own lazily-loaded chunk.
 */
export const createServiceSelector =
  <TService, TConfig, TId extends string>(
    registry: Record<TId, (config: TConfig) => Promise<TService | null>>,
  ) =>
  async (provider: TId, config: TConfig): Promise<TService> => {
    const build = registry[provider];

    if (!build) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    const service = await build(config);

    if (!service) {
      throw new Error(
        `Provider '${provider}' is selected but its configuration is missing.`,
      );
    }

    return service;
  };
