import { getTranslations } from "next-intl/server";

import type { SearchContext } from "@nimara/infrastructure/use-cases/search/types";

import { DEFAULT_RESULTS_PER_PAGE, DEFAULT_SORT_BY } from "@/config";
import { clientEnvs } from "@/envs/client";
import { JsonLd, mappedSearchProductsToJsonLd } from "@/lib/json-ld";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { searchService } from "@/services/search";

import { Breadcrumbs } from "../_components/breadcrumbs";
import { ProductsList } from "../_components/products-list";
import { SearchPagination } from "../_components/search-pagination";
import { FiltersContainer } from "./_filters/filters-container";
import { NoResults } from "./_listing/no-results";
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
  const canonicalUrl = new URL(
    paths.search.asPath(),
    clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
  ).toString();

  const t = await getTranslations("search");

  return {
    title: searchParams.q
      ? t("search-for", { query: searchParams.q })
      : t("all-products"),
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
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function Page(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  const [t, region] = await Promise.all([
    getTranslations(),
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
    ...rest
  } = searchParams;
  const resultSearch = await searchService.search(
    {
      query,
      limit: limit ? Number.parseInt(limit) : DEFAULT_RESULTS_PER_PAGE,
      page,
      after,
      before,
      sortBy,
      filters: rest,
    },
    searchContext,
  );
  const getFacetsResult = await searchService.getFacets(
    {
      query,
    },
    searchContext,
  );
  const resultOptions = searchService.getSortByOptions(searchContext);
  const options = resultOptions.ok ? resultOptions.data : [];

  const formatFilterHeader = (filterValue?: string) => {
    if (!filterValue) {
      return null;
    }

    const items = filterValue.split(",").map((item) =>
      item
        .trim()
        .replace(/-/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase()),
    );

    if (items.length === 1) {
      return items[0];
    }
    if (items.length === 2) {
      return `${items[0]} ${t("common.and")} ${items[1]}`;
    }

    return `${items.slice(0, -1).join(", ")} ${t("common.and")} ${items[items.length - 1]}`;
  };

  const getHeader = () => {
    if (query) {
      return t("search.results-for", { query });
    }

    const categoryHeader = formatFilterHeader(searchParams.category);
    const collectionHeader = formatFilterHeader(searchParams.collection);

    if (categoryHeader) {
      return categoryHeader;
    }
    if (collectionHeader) {
      return collectionHeader;
    }

    return t("search.all-products");
  };

  const products = resultSearch.ok ? resultSearch.data.results : [];
  const pageInfo = resultSearch.ok ? resultSearch.data.pageInfo : null;

  return (
    <div className="w-full">
      <Breadcrumbs pageName={getHeader()} />
      <section className="mx-auto my-8 grid gap-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">{getHeader()}</h2>
          <div className="flex gap-4">
            <div className="hidden md:block">
              <SearchSortBy options={options} searchParams={searchParams} />
            </div>
            <FiltersContainer
              facets={getFacetsResult.ok ? getFacetsResult.data : []}
              searchParams={searchParams}
              sortByOptions={options}
            />
          </div>
        </div>

        {products.length ? <ProductsList products={products} /> : <NoResults />}

        {pageInfo && (
          <SearchPagination
            pageInfo={pageInfo}
            searchParams={searchParams}
            baseUrl={paths.search.asPath()}
          />
        )}
      </section>

      <JsonLd jsonLd={mappedSearchProductsToJsonLd(products)} />
    </div>
  );
}
