import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { Attribute } from "@nimara/domain/objects/Attribute";
import type { SearchContext } from "@nimara/infrastructure/use-cases/search/types";
import { Button } from "@nimara/ui/components/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@nimara/ui/components/carousel";

import { SearchProductCard } from "@/components/search-product-card";
import { Link } from "@/i18n/routing";
import { getAttributes } from "@/lib/helpers";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { searchService } from "@/services/search";

const attributeSlugs = [
  "homepage-grid-item-header",
  "homepage-grid-item-subheader",
  "homepage-grid-item-image",
  "homepage-button-text",
  "homepage-grid-item-header-font-color",
  "homepage-grid-item-subheader-font-color",
  "carousel-products",
];

export const ProductsGrid = async ({
  attributes,
}: {
  attributes: Attribute[] | undefined;
}) => {
  const [region, t] = await Promise.all([
    getCurrentRegion(),
    getTranslations(),
  ]);

  const searchContext = {
    currency: region.market.currency,
    channel: region.market.channel,
    languageCode: region.language.code,
  } satisfies SearchContext;

  if (attributes?.length === 0) {
    return null;
  }

  const attributesMap = getAttributes(attributes, attributeSlugs);

  const header = attributesMap["homepage-grid-item-header"];
  const subheader = attributesMap["homepage-grid-item-subheader"];
  const image = attributesMap["homepage-grid-item-image"];
  const buttonText = attributesMap["homepage-button-text"];
  const headerFontColor = attributesMap["homepage-grid-item-header-font-color"];
  const subheaderFontColor =
    attributesMap["homepage-grid-item-subheader-font-color"];
  const gridProducts = attributesMap["carousel-products"];

  const imageProductId = image?.values[0]?.reference as string;
  const gridProductsIds = gridProducts?.values?.map(
    (product) => product?.reference,
  ) as string[];

  const { results: gridImageProduct } = await searchService.search(
    {
      productIds: imageProductId ? [imageProductId] : [],
      limit: 1,
    },
    searchContext,
  );

  const { results: products } = await searchService.search(
    {
      productIds: gridProductsIds.length ? [...gridProductsIds] : [],
      limit: 7,
    },
    searchContext,
  );

  return (
    <>
      <div className="mb-12 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        <div
          className="relative min-h-44 border-stone-200 bg-cover bg-center p-6"
          style={{
            backgroundImage: `url(${gridImageProduct[0]?.thumbnail?.url})`,
          }}
        >
          <h2
            className="text-2xl opacity-100"
            style={{
              color: `${headerFontColor?.values[0]?.value ?? "#44403c"}`,
            }}
          >
            {header?.values[0]?.plainText}
          </h2>
          <h3
            className="text-sm"
            style={{
              color: `${subheaderFontColor?.values[0]?.value ?? "#78716c"}`,
            }}
          >
            {subheader?.values[0]?.plainText}
          </h3>
          <Button
            className="absolute bottom-4 right-4 p-3"
            variant="outline"
            asChild
          >
            <Link
              href={paths.search.asPath()}
              aria-label={t("search.all-products-link")}
            >
              <ArrowRight className="h-4 w-5 pl-1" />
            </Link>
          </Button>
        </div>
        {products.map((product) => (
          <div className="hidden sm:block" key={product.id}>
            <SearchProductCard
              product={product}
              sizes="(max-width: 720px) 1vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        ))}

        <Carousel className="sm:hidden">
          <CarouselContent>
            {products.map((product) => (
              <CarouselItem key={product.id} className="w-2/3 flex-none">
                <SearchProductCard
                  product={product}
                  sizes="(max-width: 360px) 195px, (max-width: 720px) 379px, 1vw"
                  height={200}
                  width={200}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      <div className="mx-auto mb-14">
        <Button variant="outline" asChild>
          <Link href={paths.search.asPath()}>
            {buttonText?.values[0]?.plainText}
            <ArrowRight className="h-4 w-5 pl-1" />
          </Link>
        </Button>
      </div>
    </>
  );
};
