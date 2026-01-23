"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import type { SearchProduct } from "@nimara/domain/objects/SearchProduct";
import { SearchProductCard } from "@nimara/features/shared/product/search-product-card";
import { useLocalizedLink } from "@nimara/foundation/i18n/hooks/use-localized-link";
import { Button } from "@nimara/ui/components/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@nimara/ui/components/carousel";

type ProductWithPath = SearchProduct & { path: string };

type ProductsGridClientProps = {
  buttonText: string | undefined;
  header: string | undefined;
  headerFontColor: string | undefined;
  image: string | undefined;
  products: ProductWithPath[];
  searchPath: string;
  subheader: string | undefined;
  subheaderFontColor: string | undefined;
};

export const ProductsGridClient = ({
  products,
  header,
  subheader,
  image,
  buttonText,
  headerFontColor,
  subheaderFontColor,
  searchPath,
}: ProductsGridClientProps) => {
  const t = useTranslations();
  const LocalizedLink = useLocalizedLink();

  if (!products.length) {
    return null;
  }

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
            className="absolute right-4 bottom-4 p-3"
            variant="outline"
            asChild
            size="icon"
          >
            <LocalizedLink
              href={searchPath}
              aria-label={t("search.all-products-link")}
            >
              <ArrowRight />
            </LocalizedLink>
          </Button>
        </div>
        {products.map((product) => (
          <div className="hidden sm:block" key={product.id}>
            <SearchProductCard
              product={product}
              productPath={product.path}
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
                  productPath={product.path}
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
          <LocalizedLink href={searchPath}>
            {buttonText}
            <ArrowRight className="h-4 w-5 pl-1" />
          </LocalizedLink>
        </Button>
      </div>
    </>
  );
};
