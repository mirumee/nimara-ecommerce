import type { IndicesSettings } from "@nimara/infrastructure/search/algolia/types";

/**
 * Algolia index layout for the storefront, per channel + currency.
 *
 * This is deployment-specific data (it mirrors the indices and virtual replicas
 * you created in your Algolia application), so it lives in app config rather
 * than being derived from env. Fill it in before switching `SEARCH_PROVIDER` to
 * `algolia`.
 *
 * @example
 * ```ts
 * export const ALGOLIA_INDICES: IndicesSettings = [
 *   {
 *     channel: "channel-us",
 *     currency: "USD",
 *     indexName: "PROD.channel-us.USD.products",
 *     availableFacets: {
 *       "attributes.size": { messageKey: "filters.size", type: "DROPDOWN" },
 *     },
 *     virtualReplicas: [
 *       {
 *         indexName: "PROD.channel-us.USD.products.name_asc",
 *         messageKey: "search.name-asc",
 *         queryParamValue: "name-asc",
 *       },
 *     ],
 *   },
 * ];
 * ```
 *
 * @see https://www.algolia.com/doc/guides/managing-results/refine-results/sorting/in-depth/replicas
 */
export const ALGOLIA_INDICES: IndicesSettings = [];
