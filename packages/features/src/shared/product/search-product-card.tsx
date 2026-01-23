"use client";

import Image, { type ImageProps } from "next/image";
import { useTranslations } from "next-intl";
import type { PropsWithChildren } from "react";

import type { SearchProduct } from "@nimara/domain/objects/SearchProduct";
import { DiscountBadge } from "@nimara/features/shared/product/discount-badge";
import { getDiscountInfo, Price } from "@nimara/features/shared/product/price";
import { useLocalizedLink } from "@nimara/foundation/i18n/hooks/use-localized-link";

import productPlaceholder from "@/assets/product_placeholder.svg?url";

import { ProductImagePlaceholder } from "./product-image-placeholder";

export const ProductName = ({ children }: PropsWithChildren) => (
  <h2 className="line-clamp-1 overflow-hidden text-left text-ellipsis">
    {children}
  </h2>
);

export const ProductThumbnail = ({ alt, ...props }: ImageProps) => (
  <div className="relative aspect-square overflow-hidden">
    <Image alt={alt} fill className="object-cover object-top" {...props} />
  </div>
);

type Props = {
  product: SearchProduct;
  productPath: string;
} & Pick<ImageProps, "height" | "width" | "sizes">;

export const SearchProductCard = ({
  product: { thumbnail, name, price, undiscountedPrice },
  sizes,
  productPath,
}: Props) => {
  const t = useTranslations();
  const LocalizedLink = useLocalizedLink();

  const { discountPercent } = getDiscountInfo(price, undiscountedPrice);

  return (
    <article className="row-span-3">
      <LocalizedLink
        className="grid gap-2"
        title={t(`search.go-to-product`, { name })}
        href={productPath}
      >
        <div className="relative">
          {thumbnail ? (
            <ProductThumbnail
              alt={t("products.image-alt", { productName: name })}
              aria-hidden={true}
              aria-label={name}
              src={thumbnail?.url ?? productPlaceholder}
              sizes={
                sizes ??
                "(max-width: 720px) 100vw, (max-width: 1024px) 50vw, (max-width: 1294px) 33vw, 25vw"
              }
            />
          ) : (
            <div className="bg-accent flex aspect-square justify-center overflow-hidden">
              <ProductImagePlaceholder className="min-w-full object-cover object-top" />
            </div>
          )}
          <DiscountBadge discount={discountPercent} />
        </div>

        <div>
          <ProductName>{name}</ProductName>
          <Price price={price} undiscountedPrice={undiscountedPrice} />
        </div>
      </LocalizedLink>
    </article>
  );
};
