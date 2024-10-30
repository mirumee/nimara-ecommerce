import type { BaseHit } from "instantsearch.js";

import type { SearchProduct } from "@nimara/domain/objects/SearchProduct";
import type {
  Facet,
  SearchContext,
} from "@nimara/infrastructure/use-cases/search/types";

export type RecordSerializer<O, T extends BaseHit = Record<string, any>> = {
  (data: T): Readonly<O>;
};

export type AlgoliaSearchServiceConfig = {
  credentials: {
    apiKey: string;
    appId: string;
  };
  serializers?: {
    search?: RecordSerializer<SearchProduct>;
  };
  settings: {
    indices: IndicesSettings;
  };
};

export type IndicesSettings = Array<
  {
    /**
     * An object with defined facets within given index. {@link AvailableFacets}.
     */
    availableFacets: AvailableFacets;
    /**
     * A main index name.
     *
     * @example
     * "DEV.channel-us.USD.products"
     */
    indexName: string;
    /**
     * An array of virtual replicas used for sorting. {@link VirtualReplica}.
     */
    virtualReplicas: Array<VirtualReplica>;
  } & SearchContext
>;

/**
 * A virtual replica config used to define a possible sorting options.
 *
 * @see https://www.algolia.com/doc/guides/managing-results/refine-results/sorting/in-depth/replicas Understanding replicas - Algolia Documentation
 * @example
 * ```ts
 * {
 *   indexName: "DEV.channel-us.USD.products.name_asc",
 *   messageKey: "search.name-asc",
 *   queryParamValue: "alpha-asc",
 * }
 *  ```
 */
export type VirtualReplica = {
  /**
   * Index name used for sorting (Virtual Replica).
   *
   * @example
   * "DEV.channel-uk.GBP.products.name_asc"
   */
  indexName: string;
  /**
   * A message key with namespace used for translations.
   *
   * @example
   * "search.name-asc"
   */
  messageKey: string;
  /**
   * A value that will be stored in search URL. - /search?sortBy={THIS VALUE}.
   *
   * @example
   * "name-asc"
   */
  queryParamValue: string;
};

/**
 * An object with available facets for given index, where the key is name of the attribute in Algolia.
 *
 * @example
 * ```ts
 *   "attributes.Artists": {
 *     messageKey: "filters.artists",
 *     type: "DROPDOWN",
 *   },
 * ```
 */
export type AvailableFacets = Record<string, Omit<Facet, "choices">>;
