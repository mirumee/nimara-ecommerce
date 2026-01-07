import type { SortByOption } from "@nimara/domain/objects/Search";
import type { SearchProduct } from "@nimara/domain/objects/SearchProduct";
import { type Facet, type PageInfo, type SearchContext } from "@nimara/infrastructure/use-cases/search/types";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

import { JsonLd, mappedSearchProductsToJsonLd } from "@nimara/features/json-ld/json-ld";

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
    render: (data: SearchProviderData) => React.ReactNode;
    searchParams: SearchParams;
    services: ServiceRegistry;
    defaultResultsPerPage: number;
    defaultSortBy: string;
}

export const SearchProvider = async ({
    render,
    searchParams,
    services,
    defaultResultsPerPage,
    defaultSortBy,
}: SearchProviderProps) => {
    const searchContext = {
        currency: services.region.market.currency,
        channel: services.region.market.channel,
        languageCode: services.region.language.code,
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
        Object.entries(rest).filter(([_, value]) => value !== undefined)
    ) as Record<string, string>;

    const [resultSearch, getFacetsResult, resultOptions] = await Promise.all([
        services.search.search(
            {
                query,
                limit: limit ? Number.parseInt(limit) : defaultResultsPerPage,
                page,
                after,
                before,
                sortBy,
                filters,
            },
            searchContext,
        ),
        services.search.getFacets(
            {
                query,
                filters,
            },
            searchContext,
        ),
        services.search.getSortByOptions(searchContext),
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

