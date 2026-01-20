import { ProductsList } from "@nimara/features/shared/product-list/products-list";
import { SearchPagination } from "@nimara/features/shared/product-list/search-pagination";
import { Skeleton } from "@nimara/ui/components/skeleton";

import { Breadcrumbs } from "../shared/components/breadcrumbs";
import { FiltersContainer } from "../shared/components/filters/filters-container";
import { NoResults } from "../shared/components/listing/no-results";
import { SearchSortBy } from "../shared/components/listing/search-sort-by";
import { SearchHeader } from "../shared/components/search-header";
import { SearchProvider } from "../shared/providers/search-provider";
import { type SearchViewProps } from "../shared/types";

/**
 * Standard view for the search page.
 * @param props - The properties for the search view.
 * @returns A React component rendering the standard search page.
 */
export const StandardSearchView = async (props: SearchViewProps) => {
  const {
    searchParams: searchParamsPromise,
    services,
    paths,
    localePrefixes,
    defaultLocale,
    defaultResultsPerPage,
    handleFiltersFormSubmit,
  } = props;
  const searchParams = await searchParamsPromise;
  const headerText = await SearchHeader(searchParams);

  return (
    <SearchProvider
      searchParams={searchParams}
      services={services}
      defaultResultsPerPage={defaultResultsPerPage}
      defaultSortBy={props.defaultSortBy}
      render={({ products, pageInfo, facets, sortByOptions, searchParams }) => (
        <div className="w-full">
          <Breadcrumbs pageName={headerText} homePath={paths.home} />
          <section className="mx-auto my-8 grid gap-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl">{headerText}</h2>
              <div className="flex gap-4">
                <div className="hidden md:block">
                  <SearchSortBy
                    options={sortByOptions}
                    searchParams={searchParams}
                    defaultSortBy={props.defaultSortBy}
                  />
                </div>
                <FiltersContainer
                  facets={facets}
                  searchParams={searchParams}
                  sortByOptions={sortByOptions}
                  defaultSortBy={props.defaultSortBy}
                  handleFiltersFormSubmit={handleFiltersFormSubmit}
                />
              </div>
            </div>

            {products.length ? (
              <ProductsList products={products} productPath={paths.product} />
            ) : (
              <NoResults />
            )}

            {pageInfo && (
              <SearchPagination
                pageInfo={pageInfo}
                searchParams={searchParams}
                baseUrl={paths.search}
                localePrefixes={localePrefixes}
                defaultLocale={defaultLocale}
              />
            )}
          </section>
        </div>
      )}
    />
  );
};

/**
 * Skeleton component for the standard search view.
 * This component is used to display a loading state while the search data is being fetched.
 * @returns A skeleton component for the standard search view.
 */
export interface StandardSearchViewSkeletonProps {
  defaultResultsPerPage: number;
}

export const StandardSearchViewSkeleton = ({
  defaultResultsPerPage,
}: StandardSearchViewSkeletonProps) => (
  <div className="w-full">
    <section className="mx-auto my-6 grid">
      <div className="my-8 flex h-4 items-center justify-between">
        <Skeleton className="h-10 w-1/5" />

        <div className="flex w-48 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {Array(defaultResultsPerPage)
          .fill(null)
          .map((_, idx) => (
            <Skeleton key={idx} className="aspect-square w-full" />
          ))}
      </div>
    </section>
  </div>
);
