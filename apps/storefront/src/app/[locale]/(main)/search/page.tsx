import { getTranslations } from "next-intl/server";

import type { SearchContext } from "@nimara/infrastructure/use-cases/search/types";

import { DEFAULT_RESULTS_PER_PAGE, DEFAULT_SORT_BY } from "@/config";
import { JsonLd, mappedSearchProductsToJsonLd } from "@/lib/json-ld";
import { getCurrentRegion } from "@/regions/server";
import { searchService } from "@/services/search";

import { FiltersContainer } from "./_filters/filters-container";
import { NoResults } from "./_listing/no-results";
import { ProductsList } from "./_listing/products-list";
import { SearchPagination } from "./_listing/search-pagination";
import { SearchSortBy } from "./_listing/search-sort-by";

type SearchParams = Promise<{
  after?: string;
  before?: string;
  category?: string;
  collection?: string;
  limit?: string;
  page?: string;
  q?: string;
  sortBy?: string;
}>;

export async function generateMetadata(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  const t = await getTranslations("search");

  return {
    title: searchParams.q
      ? t("search-for", { query: searchParams.q })
      : t("search-results"),
    openGraph: {
      images: [
        {
          url: "/og-hp.png",
          width: 1200,
          height: 630,
          alt: t("search-preview"),
        },
      ],
    },
  };
}

export default async function Page(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const [t, region] = await Promise.all([
    getTranslations("search"),
    getCurrentRegion(),
  ]);

  const searchContext = {
    currency: region.market.currency,
    channel: region.market.channel,
    languageCode: region.language.code,
  } satisfies SearchContext;

  const {
    page,
    after,
    before,
    sortBy = DEFAULT_SORT_BY,
    q: query = "",
    limit,
    category,
    collection,
    ...rest
  } = searchParams;
  const { results, pageInfo } = await searchService.search(
    {
      query,
      limit: limit ? Number.parseInt(limit) : DEFAULT_RESULTS_PER_PAGE,
      page,
      after,
      before,
      sortBy,
      filters: rest,
      category,
      collection,
    },
    searchContext,
  );
  const { facets } = await searchService.getFacets(
    {
      query,
    },
    searchContext,
  );
  const { options } = searchService.getSortByOptions(searchContext);

  const getHeader = () => {
    if (query) {
      return t("results-for", { query });
    }

    const headerKey = searchParams.category || searchParams.collection;

    if (headerKey) {
      return (headerKey[0].toUpperCase() + headerKey.slice(1)).replaceAll(
        "-",
        " & ",
      );
    }

    return null;
  };

  return (
    <div className="w-full">
      <section className="mx-auto my-8 grid gap-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">{getHeader()}</h2>
          <div className="flex gap-4">
            <div className="hidden md:block">
              <SearchSortBy options={options} searchParams={searchParams} />
            </div>
            <FiltersContainer
              facets={facets}
              searchParams={searchParams}
              sortByOptions={options}
            />
          </div>
        </div>

        {!!results.length ? <ProductsList products={results} /> : <NoResults />}

        {pageInfo && (
          <SearchPagination pageInfo={pageInfo} searchParams={searchParams} />
        )}
      </section>
      <JsonLd jsonLd={mappedSearchProductsToJsonLd(results)} />
    </div>
  );
}
