"use client";

import Image, { type ImageProps } from "next/image";
import { useTranslations } from "next-intl";
import type { PropsWithChildren } from "react";

import type { SearchProduct } from "@nimara/domain/objects/SearchProduct";

import productPlaceholder from "@/assets/product_placeholder.svg?url";
import { Link } from "@/i18n/routing";
import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";
import { paths } from "@/lib/paths";

export const ProductName = ({ children }: PropsWithChildren) => (
  <h2 className="text-left">{children}</h2>
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
  <div className="flex justify-center">
    <Image alt={alt} className="min-w-full object-contain" {...props} />
  </div>
);

type Props = {
  product: SearchProduct;
} & Pick<ImageProps, "height" | "width" | "sizes">;

export const SearchProductCard = ({
  product: { slug, thumbnail, name, price },
  sizes,
  height,
  width,
}: Props) => {
  const t = useTranslations();

  const formatter = useLocalizedFormatter();

  return (
    <Link
      className="grid gap-4 rounded-lg bg-white"
      title={t(`search.go-to-product`, { name })}
      href={paths.products.asPath({
        slug: slug,
      })}
    >
      <ProductThumbnail
        alt={`Image of ${name}`}
        aria-hidden={true}
        aria-label={name}
        height={height ?? 256}
        src={thumbnail?.url ?? productPlaceholder}
        width={width ?? 256}
        sizes={
          sizes ??
          "(max-width: 720px) 100vw, (max-width: 1024px) 50vw, (max-width: 1294px) 33vw, 25vw"
        }
      />
      <div>
        <ProductName>{name}</ProductName>
        <ProductPrice>
          {price === 0 ? t("common.free") : formatter.price({ amount: price })}
        </ProductPrice>
      </div>
    </Link>
  );
};
