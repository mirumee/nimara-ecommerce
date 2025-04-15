"use client";
import { Truck, Undo2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import type { Cart } from "@nimara/domain/objects/Cart";
import type {
  Product,
  ProductAvailability,
} from "@nimara/domain/objects/Product";
import type { User } from "@nimara/domain/objects/User";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@nimara/ui/components/alert";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@nimara/ui/components/carousel";

import { ProductImagePlaceholder } from "@/components/product-image-placeholder";

import { useVariantSelection } from "../hooks/useVariantSelection";
import { AttributesDropdown } from "./attributes-dropdown";
import { VariantSelector } from "./variant-selector";
import { getImagesToDisplay } from "./variant-selector-utils";

export const ProductDetails = ({
  product,
  availability,
  cart,
  user,
}: {
  availability: ProductAvailability;
  cart: Cart | null;
  product: Product;
  user: (User & { accessToken: string | undefined }) | null;
}) => {
  const t = useTranslations("products");

  const { chosenVariant, looselyMatchingVariants } = useVariantSelection({
    product,
    productAvailability: availability,
    cart,
  });

  const { images, name, description } = product;

  const imagesToDisplay = getImagesToDisplay({
    chosenVariant,
    looselyMatchingVariants,
    productImages: images,
  });

  const hasFreeShipping = !!product.attributes
    .find(({ slug }) => slug === "free-shipping")
    ?.values.find(({ boolean }) => boolean);

  const hasFreeReturn = !!product.attributes
    .find(({ slug }) => slug === "free-return")
    ?.values.find(({ boolean }) => boolean);

  const attributesToDisplay = product.attributes.filter(
    ({ slug }) => slug !== "free-shipping" && slug !== "free-return",
  );

  if (description && description?.length > 0) {
    attributesToDisplay.unshift({
      name: "description",
      slug: "description",
      type: "RICH_TEXT",
      values: [
        {
          name: "description",
          slug: "description",
          richText: product.description ?? "",
          boolean: false,
          value: "",
          date: undefined,
          dateTime: undefined,
          reference: undefined,
          plainText: "",
        },
      ],
    });
  }

  return (
    <div className="my-6 grid gap-10 md:grid-cols-12 md:gap-4">
      <div className="relative max-md:hidden md:col-span-6 [&>*]:pb-2">
        {imagesToDisplay.length ? (
          <>
            {imagesToDisplay.map(({ url, alt }, i) => (
              <Image
                src={url}
                key={url}
                alt={alt || name}
                height={500}
                width={500}
                priority={i === 0}
                sizes="(max-width: 960px) 100vw, 50vw"
                className="h-auto w-full"
              />
            ))}
          </>
        ) : (
          <ProductImagePlaceholder />
        )}
      </div>

      <Carousel className="md:hidden">
        <CarouselContent>
          {imagesToDisplay.map(({ url, alt }, i) => (
            <CarouselItem key={url}>
              <Image
                src={url}
                alt={alt || name}
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

      <div className="md:col-span-5 md:col-start-8">
        <section className="sticky top-28 px-1 pt-10">
          <h1 className="text-2xl text-black">{name}</h1>
          <VariantSelector
            cart={cart}
            product={product}
            productAvailability={availability}
            user={user}
          />

          {hasFreeShipping && (
            <Alert>
              <Truck className="size-4" />
              <AlertTitle>{t("free-shipping")}</AlertTitle>
              <AlertDescription>{t("standard-parcel")}</AlertDescription>
            </Alert>
          )}

          {hasFreeReturn && (
            <Alert className="mt-2">
              <Undo2 className="size-4" />
              <AlertTitle>{t("free-30-days")}</AlertTitle>
            </Alert>
          )}

          <AttributesDropdown attributes={attributesToDisplay} />
        </section>
      </div>
    </div>
  );
};
