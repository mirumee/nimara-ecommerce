import Image from "next/image";
import type { PropsWithChildren } from "react";

export const ProductName = ({ children }: PropsWithChildren) => (
  <h2 className="line-clamp-1 overflow-hidden text-ellipsis text-left">
    {children}
  </h2>
);

export const ProductPrice = ({ children }: PropsWithChildren) => (
  <h3 className="text-left text-gray-400">{children}</h3>
);

type ProductThumbnailProps = {
  alt: string;
  sizes?: string;
  src: string;
};

export const ProductThumbnail = ({ alt, ...props }: ProductThumbnailProps) => (
  <div className="relative aspect-square overflow-hidden">
    <Image alt={alt} fill className="object-cover object-top" {...props} />
  </div>
);

type Props = {
  fallback?: React.ReactNode;
  formatter?: (price: number) => string;
  freeLabel?: string;
  goToLabel?: string;
  imageAltLabel?: string;
  name: string;
  placeholderUrl?: string;
  price: number;
  productHref: string;
  sizes?: string;
  thumbnailUrl?: string;
};

export const SearchProductCard = ({
  name,
  price,
  thumbnailUrl,
  productHref,
  formatter,
  freeLabel = "Free",
  goToLabel = "Go to product",
  imageAltLabel = "Product image",
  placeholderUrl,
  fallback,
  sizes,
}: Props) => {
  return (
    <article className="row-span-3">
      <a
        className="grid gap-2"
        title={`${goToLabel} ${name}`}
        href={productHref}
      >
        {thumbnailUrl ? (
          <ProductThumbnail
            alt={`${imageAltLabel} ${name}`}
            aria-hidden={true}
            aria-label={name}
            src={thumbnailUrl ?? placeholderUrl}
            sizes={
              sizes ??
              "(max-width: 720px) 100vw, (max-width: 1024px) 50vw, (max-width: 1294px) 33vw, 25vw"
            }
          />
        ) : (
          (fallback ?? (
            <div className="bg-accent flex aspect-square justify-center overflow-hidden" />
          ))
        )}

        <div>
          <ProductName>{name}</ProductName>
          <ProductPrice>
            {price === 0 ? freeLabel : (formatter?.(price) ?? `${price} USD`)}
          </ProductPrice>
        </div>
      </a>
    </article>
  );
};
