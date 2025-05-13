"use client";

import Image, { type ImageProps } from "next/image";
import { useTranslations } from "next-intl";
import type { PropsWithChildren } from "react";

import type { SearchProduct } from "@nimara/domain/objects/SearchProduct";

import productPlaceholder from "@/assets/product_placeholder.svg?url";
import { Link } from "@/i18n/routing";
import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";
import { paths } from "@/lib/paths";

import { ProductImagePlaceholder } from "./product-image-placeholder";

export const ProductName = ({ children }: PropsWithChildren) => (
  <h2 className="line-clamp-1 overflow-hidden text-ellipsis text-left">
    {children}
  </h2>
);

export const ProductPrice = ({ children }: PropsWithChildren) => {
  const t = useTranslations();

  return (
    <h3 aria-label={t("common.price")} className="text-left text-gray-400">
      {children}
    </h3>
  );
};

export const ProductThumbnail = ({ alt, ...props }: ImageProps) => (
  <div className="relative aspect-square overflow-hidden">
    <Image alt={alt} fill className="object-cover object-top" {...props} />
  </div>
);

type Props = {
  product: SearchProduct;
} & Pick<ImageProps, "height" | "width" | "sizes">;

export const SearchProductCard = ({
  product: { slug, thumbnail, name, price },
  sizes,
}: Props) => {
  const t = useTranslations();

  const formatter = useLocalizedFormatter();

  return (
    <article className="row-span-3">
      <Link
        className="grid gap-2"
        title={t(`search.go-to-product`, { name })}
        href={paths.products.asPath({
          slug: slug,
        })}
      >
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

        <div>
          <ProductName>{name}</ProductName>
          <ProductPrice>
            {price === 0
              ? t("common.free")
              : formatter.price({ amount: price })}
          </ProductPrice>
        </div>
      </Link>
    </article>
  );
};
