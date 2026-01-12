import type { PageField } from "@nimara/domain/objects/CMSPage";
import type { ServiceRegistry } from "@nimara/infrastructure/types";
import type { SearchContext } from "@nimara/infrastructure/use-cases/search/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@nimara/ui/components/carousel";
import { Skeleton } from "@nimara/ui/components/skeleton";

import { createFieldsMap, type FieldsMap } from "../utils/create-fields-map";
import { ProductsGridClient } from "./products-grid-client";

export interface ProductsGridProps {
  fields: PageField[] | undefined;
  productPath: (slug: string) => string;
  searchPath: string;
  services: ServiceRegistry;
}

export const ProductsGrid = async ({
  fields,
  services,
  productPath,
  searchPath,
}: ProductsGridProps) => {
  const searchContext = {
    currency: services.region.market.currency,
    channel: services.region.market.channel,
    languageCode: services.region.language.code,
  } satisfies SearchContext;

  if (!fields || fields.length === 0) {
    return null;
  }

  const fieldsMap: FieldsMap = createFieldsMap(fields);

  const header = fieldsMap["homepage-grid-item-header"]?.text;
  const subheader = fieldsMap["homepage-grid-item-subheader"]?.text;
  const image = fieldsMap["homepage-grid-item-image"]?.imageUrl;
  const buttonText = fieldsMap["homepage-button-text"]?.text;
  const headerFontColor =
    fieldsMap["homepage-grid-item-header-font-color"]?.text;
  const subheaderFontColor =
    fieldsMap["homepage-grid-item-subheader-font-color"]?.text;
  const gridProducts = fieldsMap["carousel-products"];

  const gridProductsIds = gridProducts?.reference;

  const result = await services.search.search(
    {
      productIds: gridProductsIds?.length ? [...gridProductsIds] : [],
      limit: 7,
    },
    searchContext,
  );

  const products = result.ok ? result.data.results : [];

  // Map products to include their paths
  const productsWithPaths = products.map((product) => ({
    ...product,
    path: productPath(product.slug),
  }));

  return (
    <ProductsGridClient
      products={productsWithPaths}
      header={header}
      subheader={subheader}
      image={image}
      buttonText={buttonText}
      headerFontColor={headerFontColor}
      subheaderFontColor={subheaderFontColor}
      searchPath={searchPath}
    />
  );
};

export const ProductsGridSkeleton = () => {
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
