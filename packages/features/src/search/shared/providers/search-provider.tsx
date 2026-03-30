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
  region,
}: SearchProviderProps) => {
  const searchContext = {
    currency: region.market.currency,
    channel: region.market.channel,
    languageCode: region.language.code,
  } satisfies SearchContext;

  const {
    page,
    after,
    before,
    sortBy = defaultSortBy,
    q: query = "",
    limit,
    ...rest
  } = searchParams;

  const filters = Object.fromEntries(
    Object.entries(rest).filter(([_, value]) => value !== undefined),
  ) as Record<string, string>;

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
