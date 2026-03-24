import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { ProductsList } from "@nimara/features/shared/product-list/products-list";
import { SearchPagination } from "@nimara/features/shared/product-list/search-pagination";
import { Skeleton } from "@nimara/ui/components/skeleton";

import { Breadcrumbs } from "../shared/components/breadcrumbs";
import { FiltersContainer } from "../shared/components/filters/filters-container";
import { SearchSortBy } from "../shared/components/listing/search-sort-by";
import { SearchProvider } from "../shared/providers/search-provider";
import { type VendorSearchViewProps } from "../shared/types";

const FALLBACK_HERO_BACKGROUND =
  "linear-gradient(135deg, #0A1E7A 0%, #2563EB 55%, #7DD3FC 100%)";
const FALLBACK_LOGO_BACKGROUND =
  "linear-gradient(145deg, #F59E0B 0%, #FCD34D 100%)";

async function VendorNoProducts() {
  const t = await getTranslations("vendor");

  return <h2 className="text-xl">{t("no_products")}</h2>;
}

function vendorInitials(displayTitle: string): string {
  const words = displayTitle.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "V";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function VendorHero({
  branding,
}: {
  branding: VendorSearchViewProps["vendorBranding"];
}) {
  const { backgroundImageUrl, displayTitle, logoUrl } = branding;

  return (
    <div className="relative mt-6 mb-8 w-full overflow-hidden md:mt-8">
      <div className="relative aspect-[1920/512] w-full">
        {backgroundImageUrl ? (
          <Image
            src={backgroundImageUrl}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ backgroundImage: FALLBACK_HERO_BACKGROUND }}
            aria-hidden
          />
        )}
        <div
          className="absolute inset-0 bg-black/40 dark:bg-black/50"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-row flex-wrap items-center gap-3 p-4 text-left md:gap-4 md:p-6 md:pb-8 md:pl-8">
          {logoUrl ? (
            <div className="relative h-12 w-12 shrink-0 rounded-full border border-white/90 bg-transparent p-0.5 shadow-[0_10px_28px_rgba(0,0,0,0.5)] ring-2 ring-black/20 md:h-16 md:w-16">
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image
                  src={logoUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            </div>
          ) : (
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-amber-100/90 text-sm font-semibold tracking-wide text-amber-950 shadow-[0_10px_28px_rgba(0,0,0,0.5)] ring-2 ring-black/20 md:h-16 md:w-16 md:text-base"
              style={{ backgroundImage: FALLBACK_LOGO_BACKGROUND }}
              aria-label={`${displayTitle} logo placeholder`}
              role="img"
            >
              {vendorInitials(displayTitle)}
            </div>
          )}
          <h1 className="min-w-0 text-2xl font-semibold tracking-tight text-white drop-shadow-md md:text-3xl">
            {displayTitle}
          </h1>
        </div>
      </div>
    </div>
  );
}

/**
 * Vendor marketplace PLP: search layout plus hero (background + logo) and scoped product metadata filter.
 */
export const VendorSearchView = async (props: VendorSearchViewProps) => {
  const {
    searchParams: searchParamsPromise,
    services,
    paths,
    localePrefixes,
    defaultLocale,
    defaultResultsPerPage,
    handleFiltersFormSubmit,
    region,
    productMetadata,
    vendorBranding,
    defaultSortBy,
  } = props;
  const searchParams = await searchParamsPromise;
  const headerText = vendorBranding.displayTitle;

  return (
    <SearchProvider
      searchParams={searchParams}
      services={services}
      defaultResultsPerPage={defaultResultsPerPage}
      defaultSortBy={defaultSortBy}
      productMetadata={productMetadata}
      region={region}
      render={({ products, pageInfo, facets, sortByOptions, searchParams }) => (
        <div className="w-full">
          <Breadcrumbs pageName={headerText} homePath={paths.home} />
          <VendorHero branding={vendorBranding} />
          <section className="mx-auto my-8 grid gap-8">
            <div className="flex items-center justify-between">
              <h2 className="sr-only">{headerText}</h2>
              <div className="flex w-full justify-end gap-4">
                <div className="hidden md:block">
                  <SearchSortBy
                    options={sortByOptions}
                    searchParams={searchParams}
                    defaultSortBy={defaultSortBy}
                  />
                </div>
                <FiltersContainer
                  facets={facets}
                  searchParams={searchParams}
                  sortByOptions={sortByOptions}
                  defaultSortBy={defaultSortBy}
                  handleFiltersFormSubmit={handleFiltersFormSubmit}
                />
              </div>
            </div>

            {products.length ? (
              <ProductsList products={products} productPath={paths.product} />
            ) : (
              <VendorNoProducts />
            )}

            {pageInfo ? (
              <SearchPagination
                pageInfo={pageInfo}
                searchParams={searchParams}
                baseUrl={paths.listing}
                localePrefixes={localePrefixes}
                defaultLocale={defaultLocale}
              />
            ) : null}
          </section>
        </div>
      )}
    />
  );
};

export interface VendorSearchViewSkeletonProps {
  defaultResultsPerPage: number;
}

export const VendorSearchViewSkeleton = ({
  defaultResultsPerPage,
}: VendorSearchViewSkeletonProps) => (
  <div className="w-full">
    <Skeleton className="mt-6 mb-8 aspect-[1920/512] w-full md:mt-8" />
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
