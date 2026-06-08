import type { ZodType } from "zod";

import type { Logger } from "#root/logging/types";

/**
 * Input every provider builder receives: the (server-side) env record forwarded
 * by the app plus a logger. Each provider validates only the env it needs.
 */
export type ProviderSelectInput = {
  env: Record<string, string | undefined>;
  logger: Logger;
};

/**
 * A provider's self-contained definition for a capability. `create` lazily
 * `import()`s the heavy factory (preserving per-provider code-splitting) and
 * validates its own namespaced env.
 */
export type ProviderManifest<TService, TId extends string> = {
  /**
   * Zod schema of the provider's (namespaced) env. Optional — providers without
   * env (e.g. dummy) omit it. Introspected by the integration preflight/doctor
   * to report required vs. missing keys for the selected provider.
   */
  configSchema?: ZodType;
  create: (input: ProviderSelectInput) => Promise<TService>;
  id: TId;
};

/**
 * Builds a capability's selector from its provider manifests. Returns the
 * `create(id, input)` resolver plus the `ids` tuple derived from the manifests —
 * the catalog is the manifests, so there is no separate id list to keep in sync.
 * Adding a provider is one manifest entry.
 */
export const createServiceSelector = <TService, TId extends string>(
  manifests: readonly ProviderManifest<TService, TId>[],
) => {
  const byId = new Map(manifests.map((manifest) => [manifest.id, manifest]));
  const ids = manifests.map((manifest) => manifest.id) as [TId, ...TId[]];

  const create = async (
    provider: TId,
    input: ProviderSelectInput,
  ): Promise<TService> => {
    const manifest = byId.get(provider);

    if (!manifest) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    return manifest.create(input);
  };

  return { create, ids, providers: manifests };
};

/**
 * Selector variant keyed by a canonical id tuple. The `manifests` argument is a
 * total record over `TIds`, so a capability that omits a provider — or adds an
 * unknown one — is a compile error. Used where one selection must cover several
 * capabilities in lockstep (e.g. CMS pages + menus share one `CMS_SERVICE`).
 * Catalog order is preserved.
 */
export const createKeyedServiceSelector = <
  TService,
  const TIds extends readonly [string, ...string[]],
>(
  ids: TIds,
  manifests: {
    [K in TIds[number]]: Omit<ProviderManifest<TService, K>, "id">;
  },
) =>
  createServiceSelector(
    ids.map((id) => ({
      id,
      ...manifests[id as TIds[number]],
    })) as readonly ProviderManifest<TService, TIds[number]>[],
  );
