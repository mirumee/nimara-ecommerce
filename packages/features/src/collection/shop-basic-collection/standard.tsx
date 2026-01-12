import { getTranslations } from "next-intl/server";

import { ProductsList } from "@nimara/features/shared/product-list/products-list";
import { SearchPagination } from "@nimara/features/shared/product-list/search-pagination";
import { Breadcrumbs } from "@nimara/foundation/navigation/breadcrumbs";
import { Skeleton } from "@nimara/ui/components/skeleton";

import { CollectionDescription } from "../shared/components/collection-description";
import { CollectionHeader } from "../shared/components/collection-header";
import { CollectionProvider } from "../shared/providers/collection-provider";
import { StandardCollectionViewProps } from "../shared/types";

/**
 * Standard view for the collection page.
 * @param props - The properties for the collection view.
 * @returns A React component rendering the standard collection page.
 */
export const StandardCollectionView = async (
  props: StandardCollectionViewProps,
) => {
  const [{ slug }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);

  const t = await getTranslations("collections");

  return (
    <CollectionProvider
      slug={slug}
      searchParams={searchParams}
      services={props.services}
      defaultResultsPerPage={props.defaultResultsPerPage}
      render={({ collection, pageInfo, searchParams }) => {
        if (!collection) {
          return null;
        }

        return (
          <div className="mb-8 grid w-full gap-8">
            <Breadcrumbs
              pageName={collection.name}
              homePath={props.paths.home}
            />
            <CollectionHeader
              name={collection.name}
              thumbnail={collection.thumbnail}
            />
            <CollectionDescription description={collection.description} />

            <hr />

            <h2 className="text-2xl">{t("associated-products")}</h2>

            <ProductsList
              products={collection.products}
              productPath={props.paths.product}
            />
            {pageInfo && (
              <SearchPagination
                pageInfo={pageInfo}
                searchParams={searchParams}
                baseUrl={props.paths.collection(slug)}
                localePrefixes={props.localePrefixes}
                defaultLocale={props.defaultLocale}
              />
            )}
          </div>
        );
      }}
    />
  );
};

/**
 * Skeleton component for the standard collection view.
 * This component is used to display a loading state while the collection data is being fetched.
 * @returns A skeleton component for the standard collection view.
 */
export const StandardCollectionViewSkeleton = () => (
  <div className="mb-8 grid w-full gap-8">
    <Skeleton className="h-8 w-1/4" />
    <div className="grid basis-full items-center justify-center gap-4 md:flex">
      <Skeleton className="h-8 w-1/3" />
    </div>
    <Skeleton className="mx-auto aspect-[4/3] w-full max-w-2xl" />
    <Skeleton className="h-24 w-full" />
    <hr />
    <Skeleton className="h-8 w-1/3" />
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <Skeleton key={idx} className="aspect-square w-full" />
      ))}
    </div>
  </div>
);
