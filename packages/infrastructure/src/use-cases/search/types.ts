import { type SortByOption } from "@nimara/domain/objects/Search";
import { type SearchProduct } from "@nimara/domain/objects/SearchProduct";

export type PageInfo =
  | {
      after?: string | null;
      before?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      type: "cursor";
    }
  | {
      currentPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      type: "numeric";
    };

export type SearchContext = {
  /**
   * A Saleor channel slug of the channel from which this index contains objects.
   *
   * @example
   * "channel-us"
   */
  channel: string;
  currency?: string;
  entity?: string;
  languageCode?: string;
};

export type SearchInfra = (
  params: {
    after?: string;
    before?: string;
    filters?: Record<string, string>;
    limit: number;
    page?: string;
    productIds?: string[];
    query?: string;
    sortBy?: string;
  },
  context: SearchContext,
) => Promise<{
  error: unknown;
  facets?: Facet[];
  pageInfo?: PageInfo;
  results: Array<Readonly<SearchProduct>>;
}>;
export type SearchUseCase = SearchInfra;

export type GetFacetsInfra = (
  params: {
    after?: string;
    before?: string;
    filters?: Record<string, string>;
    limit?: number;
    page?: string;
    productIds?: string[];
    query?: string;
    sortBy?: string;
  },
  context: SearchContext,
) => Promise<{ facets: Facet[] }>;
export type GetFacetsUseCase = GetFacetsInfra;

export type GetSortByOptionsInfra = (context: SearchContext) => {
  options: Array<Readonly<SortByOption>>;
};
export type GetSortByOptionsUseCase = GetSortByOptionsInfra;

export type FacetType =
  | "BOOLEAN"
  | "DATE"
  | "DATE_TIME"
  | "DROPDOWN"
  | "FILE"
  | "MULTISELECT"
  | "NUMERIC"
  | "PLAIN_TEXT"
  | "REFERENCE"
  | "RICH_TEXT"
  | "SWATCH";

/**
 * A facet object used for filtering.
 * @attr messageKey - used for UI translation
 * @attr type - used for determining which component to render on the list
 */
export type Facet = {
  choices: Array<Readonly<{ label: string; value: string }>>;
  messageKey?: string;
  name?: string;
  slug: string;
  type: FacetType;
};

export type SearchService = {
  getFacets: GetFacetsUseCase;
  getSortByOptions: GetSortByOptionsUseCase;
  search: SearchUseCase;
};
