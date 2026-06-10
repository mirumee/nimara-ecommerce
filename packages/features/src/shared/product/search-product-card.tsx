"use client";

import Image, { type ImageProps } from "next/image";
import { useTranslations } from "next-intl";
import type { PropsWithChildren } from "react";

import type { SearchProduct } from "@nimara/domain/objects/SearchProduct";
import { DiscountBadge } from "@nimara/features/shared/product/discount-badge";
import { getDiscountInfo, Price } from "@nimara/features/shared/product/price";
import { LocalizedLink } from "@nimara/i18n/routing";
import { getTrackingService } from "@nimara/infrastructure/tracking/service";

import productPlaceholder from "@/assets/product_placeholder.svg?url";

import { ProductImagePlaceholder } from "./product-image-placeholder";

const tracking = getTrackingService();

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
  listId?: string;
  listName?: string;
  product: SearchProduct;
  productPath: string;
} & Pick<ImageProps, "height" | "width" | "sizes">;

export const SearchProductCard = ({
  product,
  sizes,
  productPath,
  listId,
  listName,
}: Props) => {
  const t = useTranslations();

  const { thumbnail, name, price, undiscountedPrice } = product;
  const { discountPercent } = getDiscountInfo(price, undiscountedPrice);

  const handleClick = () => {
    if (!listId || !listName) {
      return;
    }

    void tracking.trackSelectItem({ product, listId, listName });
  };

  return (
    <article className="row-span-3">
      <LocalizedLink
        className="grid gap-2"
        title={t(`search.go-to-product`, { name })}
        href={productPath}
        onClick={handleClick}
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
