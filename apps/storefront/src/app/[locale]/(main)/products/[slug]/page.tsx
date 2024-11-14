import { Truck, Undo2 } from "lucide-react";
import { cookies } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";

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

import { getAccessToken } from "@/auth";
import { ProductImagePlaceholder } from "@/components/product-image-placeholder";
import { CACHE_TTL, COOKIE_KEY } from "@/config";
import { clientEnvs } from "@/envs/client";
import { JsonLd, productToJsonLd } from "@/lib/json-ld";
import { getCurrentRegion } from "@/regions/server";
import { cartService, storeService, userService } from "@/services";

import { AttributesDropdown } from "./components/attributes-dropdown";
import { VariantSelector } from "./components/variant-selector";

export async function generateMetadata({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const region = await getCurrentRegion();

  const serviceOpts = {
    channel: region.market.channel,
    languageCode: region.language.code,
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    countryCode: region.market.countryCode,
  };

  const { data } = await storeService(serviceOpts).getProductDetails({
    productSlug: slug,
    options: {
      next: {
        revalidate: CACHE_TTL.pdp,
        tags: [`PRODUCT:${slug}`, "DETAIL-PAGE:PRODUCT"],
      },
    },
  });

  return {
    title: data?.product?.name,
    description: data?.product?.description,
  };
}

export default async function Page({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const region = await getCurrentRegion();
  const accessToken = getAccessToken();

  const serviceOpts = {
    channel: region.market.channel,
    languageCode: region.language.code,
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    countryCode: region.market.countryCode,
  };
  const checkoutId = cookies().get(COOKIE_KEY.checkoutId)?.value;

  const [{ data }, cart, user] = await Promise.all([
    storeService(serviceOpts).getProductDetails({
      productSlug: slug,
      options: {
        next: {
          revalidate: CACHE_TTL.pdp,
          tags: [`PRODUCT:${slug}`, "DETAIL-PAGE:PRODUCT"],
        },
      },
    }),
    checkoutId
      ? cartService(serviceOpts).cartGet({
          cartId: checkoutId,
          options: { next: { tags: [`CHECKOUT:${checkoutId}`] } },
        })
      : null,
    userService.userGet(accessToken),
  ]);

  if (!data) {
    notFound();
  }

  const { availability, product } = data;
  const { images, name, description, variants } = product;

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
    <div className="w-full">
      <div className="my-6 grid gap-10 md:grid-cols-12 md:gap-4">
        <div className="relative max-md:hidden md:col-span-6 [&>*]:pb-2">
          {images.length ? (
            <>
              {images.map(({ url, alt }, i) => (
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
            {images.map(({ url, alt }) => (
              <CarouselItem key={url}>
                <Image
                  src={url}
                  alt={alt || name}
                  width={250}
                  height={250}
                  sizes="(max-width: 960px) 100vw, 1vw"
                  className="h-full w-full object-cover"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="md:col-span-5 md:col-start-8">
          <section className="sticky top-32 w-full overflow-y-auto overflow-x-hidden pt-10 md:max-h-[83vh]">
            <h1 className="text-2xl text-black">{name}</h1>
            <VariantSelector
              cart={cart}
              availability={availability}
              variants={variants}
              user={user ? { ...user, accessToken } : null}
            />

            {hasFreeShipping && (
              <Alert>
                <Truck className="size-4" />
                <AlertTitle>Free shipping</AlertTitle>

                <AlertDescription>Standard parcel</AlertDescription>
              </Alert>
            )}

            {hasFreeReturn && (
              <Alert className="mt-2">
                <Undo2 className="size-4" />
                <AlertTitle>Free 30 days return policy</AlertTitle>
              </Alert>
            )}

            <AttributesDropdown attributes={attributesToDisplay} />
          </section>
        </div>
      </div>
      <JsonLd jsonLd={productToJsonLd(product, availability)} />
    </div>
  );
}
