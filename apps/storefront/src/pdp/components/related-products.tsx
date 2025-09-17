"use client";

import { useTranslations } from "next-intl";

import { type SearchProduct } from "@nimara/domain/objects/SearchProduct";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@nimara/ui/components/carousel";

import { SearchProductCard } from "@/components/search-product-card";

export const RelatedProducts = ({
  products,
}: {
  products: SearchProduct[];
}) => {
  const t = useTranslations("products");

  return (
    <div className="relative overflow-hidden">
      <h2 className="text-primary mb-4 text-4xl">{t("you-may-also-like")}</h2>
      <Carousel>
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="flex h-auto w-4/5 flex-none flex-col md:w-1/5"
            >
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
  );
};
