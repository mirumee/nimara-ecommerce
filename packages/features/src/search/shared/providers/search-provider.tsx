import type { SortByOption } from "@nimara/domain/objects/Search";
import type { SearchProduct } from "@nimara/domain/objects/SearchProduct";
import {
  JsonLd,
  mappedSearchProductsToJsonLd,
} from "@nimara/features/json-ld/json-ld";
import { type Region } from "@nimara/foundation/regions/types";
import type { ServiceRegistry } from "@nimara/infrastructure/types";
import {
  type Facet,
  type PageInfo,
  type ProductSearchMetadataFilter,
  type SearchContext,
} from "@nimara/infrastructure/use-cases/search/types";

import { buildSearchContext } from "../helpers/fetch-facets";
import { getFiltersFromSearchParams } from "../helpers/filters";
import { type SearchParams } from "../types";

export interface SearchProviderData {
  facets: Facet[];
  pageInfo: PageInfo | null;
  products: SearchProduct[];
  searchContext: SearchContext;
  searchParams: Record<string, string>;
  sortByOptions: SortByOption[];
}

export interface SearchProviderProps {
  /** When set, merged into the `category` filter server-side, scoping results to one category without polluting the URL/searchParams (category PLP). */
  categorySlug?: string;
  defaultResultsPerPage: number;
  defaultSortBy: string;
  /** When set, merged into Saleor product search metadata filter (vendor PLP). */
  productMetadata?: ProductSearchMetadataFilter[];
  region: Region;
  render: (data: SearchProviderData) => React.ReactNode;
  searchParams: SearchParams;
  services: ServiceRegistry;
}

export const SearchProvider = async ({
  render,
  searchParams,
  services,
  defaultResultsPerPage,
  defaultSortBy,
  productMetadata,
  categorySlug,
  region,
}: SearchProviderProps) => {
  const searchContext = buildSearchContext(region);

  const {
    page,
    after,
    before,
    sortBy = defaultSortBy,
    q: query = "",
    limit,
  } = searchParams;

  const filters = {
    ...getFiltersFromSearchParams(searchParams),
    ...(categorySlug ? { category: categorySlug } : {}),
  };

  const searchService = await services.getSearchService();
  const [resultSearch, getFacetsResult, resultOptions] = await Promise.all([
    searchService.search(
      {
        query,
        limit: limit ? Number.parseInt(limit) : defaultResultsPerPage,
        page,
        after,
        before,
        sortBy,
        filters,
        productMetadata,
      },
      searchContext,
    ),
    searchService.getFacets(
      {
        query,
        filters,
      },
      searchContext,
    ),
    searchService.getSortByOptions(searchContext),
  ]);

  const products = resultSearch.ok ? resultSearch.data.results : [];
  const pageInfo = resultSearch.ok ? resultSearch.data.pageInfo : null;
  const facets = getFacetsResult.ok ? getFacetsResult.data : [];
  const sortByOptions = resultOptions.ok ? resultOptions.data : [];

  return (
    <>
      {render({
        products,
        pageInfo,
        facets,
        sortByOptions,
        searchParams: searchParams as Record<string, string>,
        searchContext,
      })}
      <JsonLd jsonLd={mappedSearchProductsToJsonLd(products)} />
    </>
  );
};
