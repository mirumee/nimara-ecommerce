"use client";

import NextImage from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { type Image } from "@nimara/domain/objects/common";
import { type Product } from "@nimara/domain/objects/Product";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@nimara/ui/components/carousel";

import { ProductImagePlaceholder } from "@/components/product-image-placeholder";
import { cn } from "@/lib/utils";
import { useSelectedVariantImages } from "@/pdp/hooks/useSelectedVariantImage";

type ProductMediaProps = {
  altTextFallback?: string;
  media: Image[];
  showAs?: "vertical" | "carousel";
  variants: Product["variants"];
};

export const ProductMedia = ({
  media,
  variants,
  altTextFallback,
  showAs = "vertical",
}: ProductMediaProps) => {
  const params = useSearchParams();
  const activeVariantImages = useSelectedVariantImages(variants, media, params);

  if (!media?.length) {
    return <ProductImagePlaceholder />;
  }

  return (
    <>
      <MobileOnlyCarousel
        altTextFallback={altTextFallback}
        images={activeVariantImages}
      />

      {showAs === "carousel" ? (
        <ProductMediaCarousel
          images={activeVariantImages}
          altTextFallback={altTextFallback}
        />
      ) : (
        <div className="relative max-md:hidden md:col-span-6 [&>*]:pb-2">
          <div className="hidden gap-4 md:grid">
            {activeVariantImages.map(({ url, alt }, i) => (
              <NextImage
                src={url}
                key={url}
                alt={alt || altTextFallback || ""}
                height={500}
                width={500}
                priority={i === 0}
                sizes="(max-width: 960px) 100vw, 50vw"
                className="h-auto w-full"
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const ProductMediaCarousel = ({
  images,
  altTextFallback,
}: {
  altTextFallback?: string;
  images: Image[];
}) => {
  const [previewImage, setPreviewImage] = useState<Image | null>(
    images.length ? images[0] : null,
  );

  useEffect(() => {
    if (images.length) {
      setPreviewImage(images[0]);
    }
  }, [images]);

  return (
    <div className="hidden flex-col items-center gap-4 md:flex">
      <div className="bg-background dark:bg-primary flex aspect-square items-center justify-center rounded-lg">
        {previewImage ? (
          <NextImage
            src={previewImage.url}
            alt={previewImage.alt || altTextFallback || ""}
            width={600}
            height={600}
            className="w-full object-cover"
            priority
          />
        ) : (
          <ProductImagePlaceholder />
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {images?.map((image, i) => (
          <div
            key={image.url}
            className={cn(
              "square bg-background border-muted flex w-1/6 min-w-20 items-center justify-center rounded-lg border",
              {
                "border-foreground": previewImage?.url === image.url,
              },
            )}
          >
            <NextImage
              src={image.url}
              alt={image.alt || altTextFallback || ""}
              height={100}
              width={100}
              className="cursor-pointer object-cover p-2"
              priority={i === 0}
              onClick={() => setPreviewImage(image)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const MobileOnlyCarousel = (props: {
  altTextFallback?: string;
  images: Image[];
}) => (
  <div className="md:hidden">
    <Carousel>
      <CarouselContent>
        {props.images?.map(({ url, alt }, i) => (
          <CarouselItem key={url}>
            <NextImage
              src={url}
              alt={alt || props.altTextFallback || ""}
              width={250}
              height={250}
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              sizes="(max-width: 960px) 100vw, 1vw"
              className="h-full w-full object-cover"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  </div>
);
