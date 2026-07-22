import { FiltersContainer } from "@nimara/features/search/shared/components/filters/filters-container";
import { NoResults } from "@nimara/features/search/shared/components/listing/no-results";
import { SearchSortBy } from "@nimara/features/search/shared/components/listing/search-sort-by";
import { SearchProvider } from "@nimara/features/search/shared/providers/search-provider";
import { ListingDescription } from "@nimara/features/shared/components/listing-description";
import { ListingHeader } from "@nimara/features/shared/components/listing-header";
import { ProductsList } from "@nimara/features/shared/product-list/products-list";
import { SearchPagination } from "@nimara/features/shared/product-list/search-pagination";
import { Breadcrumbs } from "@nimara/foundation/navigation/breadcrumbs";
import { Skeleton } from "@nimara/ui/components/skeleton";

import { CategoryProvider } from "../shared/providers/category-provider";
import { type StandardCategoryViewProps } from "../shared/types";

/**
 * Standard view for the category page.
 * @param props - The properties for the category view.
 * @returns A React component rendering the standard category page.
 */
export const StandardCategoryView = async (
  props: StandardCategoryViewProps,
) => {
  const [{ slug }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);

  return (
    <CategoryProvider
      slug={slug}
      services={props.services}
      render={({ category }) => (
        <div className="mb-8 grid w-full gap-8">
          <Breadcrumbs pageName={category.name} homePath={props.paths.home} />
          <ListingHeader
            name={category.name}
            thumbnail={category.backgroundImage}
          />
          <ListingDescription description={category.description} />

          <hr />

          <SearchProvider
            searchParams={searchParams}
            services={props.services}
            defaultResultsPerPage={props.defaultResultsPerPage}
            defaultSortBy={props.defaultSortBy}
            categorySlug={category.slug}
            region={props.region}
            render={({
              products,
              pageInfo,
              facets,
              sortByOptions,
              searchParams,
            }) => (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="sr-only">{category.name}</h2>
                  <div className="flex w-full justify-end gap-4">
                    <div className="hidden md:block">
                      <SearchSortBy
                        options={sortByOptions}
                        searchParams={searchParams}
                        defaultSortBy={props.defaultSortBy}
                      />
                    </div>
                    <FiltersContainer
                      facets={facets.filter(
                        (facet) => facet.slug !== "category",
                      )}
                      searchParams={searchParams}
                      sortByOptions={sortByOptions}
                      defaultSortBy={props.defaultSortBy}
                      handleFiltersFormSubmit={props.handleFiltersFormSubmit}
                    />
                  </div>
                </div>

                {products.length ? (
                  <ProductsList
                    products={products}
                    productPath={props.paths.product}
                    listId={`category-${slug}`}
                    listName={category.name}
                  />
                ) : (
                  <NoResults />
                )}

                {pageInfo && (
                  <SearchPagination
                    pageInfo={pageInfo}
                    searchParams={searchParams}
                    baseUrl={props.paths.category(slug)}
                    localePrefixes={props.localePrefixes}
                    defaultLocale={props.defaultLocale}
                  />
                )}
              </>
            )}
          />
        </div>
      )}
    />
  );
};

/**
 * Skeleton component for the standard category view.
 * This component is used to display a loading state while the category data is being fetched.
 * @returns A skeleton component for the standard category view.
 */
export const StandardCategoryViewSkeleton = () => (
  <div className="mb-8 grid w-full gap-8">
    <Skeleton className="h-8 w-1/4" />
    <div className="grid basis-full items-center justify-center gap-4 md:flex">
      <Skeleton className="h-8 w-1/3" />
    </div>
    <Skeleton className="aspect-[4/3] w-full" />
    <Skeleton className="h-24 w-full" />
    <hr />
    <div className="my-8 flex h-4 items-center justify-between">
      <Skeleton className="h-10 w-1/5" />
      <div className="flex w-48 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <Skeleton key={idx} className="aspect-square w-full" />
      ))}
    </div>
  </div>
);
