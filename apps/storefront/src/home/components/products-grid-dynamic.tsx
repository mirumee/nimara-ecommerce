import { type SearchContext } from "@nimara/infrastructure/use-cases/search/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@nimara/ui/components/carousel";
import { Skeleton } from "@nimara/ui/components/skeleton";

import { SearchProductCard } from "@/components/search-product-card";
import { DEFAULT_SORT_BY } from "@/config";
import { getCurrentRegion } from "@/regions/server";
import { getSearchService } from "@/services/search";

export const ProductsGridDynamic = async () => {
  const [region, searchService] = await Promise.all([
    getCurrentRegion(),
    getSearchService(),
  ]);

  const searchContext = {
    currency: region.market.currency,
    channel: region.market.channel,
    languageCode: region.language.code,
  } satisfies SearchContext;

  const resultSearch = await searchService.search(
    {
      query: "",
      limit: 50,
      sortBy: DEFAULT_SORT_BY,
    },
    searchContext,
  );

  const products = resultSearch.ok ? resultSearch.data.results : [];
  const productsCards = products.map((product, index) => {
    return (
      <SearchProductCard key={`${product.id}-${index}`} product={product} />
    );
  });

  return (
    <div className="latest-products-grid">
      {products.length && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {productsCards}
        </div>
      )}
    </div>
  );
};

export const ProductsGridDynamicSkeleton = () => {
  return (
    <>
      <div className="mb-12 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        <div className="relative min-h-44 border-stone-200 bg-stone-200 p-6">
          <Skeleton className="mb-2 h-6 w-1/2" />
          <Skeleton className="mb-4 h-4 w-1/3" />
          <Skeleton className="absolute bottom-4 right-4 h-10 w-10 rounded-md" />
        </div>

        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="hidden sm:block">
            <Skeleton className="aspect-[3/4] w-full rounded-md" />
          </div>
        ))}

        <Carousel className="sm:hidden">
          <CarouselContent>
            {Array.from({ length: 4 }).map((_, index) => (
              <CarouselItem key={index} className="w-2/3 flex-none">
                <Skeleton className="aspect-square w-full rounded-md" />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <div className="mx-auto mb-14 w-fit">
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
    </>
  );
};
