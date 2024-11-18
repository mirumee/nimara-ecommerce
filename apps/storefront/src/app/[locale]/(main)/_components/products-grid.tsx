import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { PageField } from "@nimara/domain/objects/CMSPage";
import type { SearchContext } from "@nimara/infrastructure/use-cases/search/types";
import { Button } from "@nimara/ui/components/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@nimara/ui/components/carousel";

import { SearchProductCard } from "@/components/search-product-card";
import { Link } from "@/i18n/routing";
import { createFieldsMap, type FieldsMap } from "@/lib/cms";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { searchService } from "@/services/search";

export const ProductsGrid = async ({
  fields,
}: {
  fields: PageField[] | undefined;
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

  const { results: products } = await searchService.search(
    {
      productIds: gridProductsIds?.length ? [...gridProductsIds] : [],
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
            backgroundImage: `url(${image})`,
          }}
        >
          <h2
            className="text-2xl opacity-100"
            style={{
              color: `${headerFontColor ?? "#44403c"}`,
            }}
          >
            {header}
          </h2>
          <h3
            className="text-sm"
            style={{
              color: `${subheaderFontColor ?? "#78716c"}`,
            }}
          >
            {subheader}
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
            {buttonText}
            <ArrowRight className="h-4 w-5 pl-1" />
          </Link>
        </Button>
      </div>
    </>
  );
};
