import { cookies } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@nimara/ui/components/carousel";
import { RichText } from "@nimara/ui/components/rich-text";

import { getAccessToken } from "@/auth";
import { ProductImagePlaceholder } from "@/components/product-image-placeholder";
import { CACHE_TTL, COOKIE_KEY } from "@/config";
import { clientEnvs } from "@/envs/client";
import { JsonLd, productToJsonLd } from "@/lib/json-ld";
import { getCurrentRegion } from "@/regions/server";
import { cartService, storeService, userService } from "@/services";

import { VariantSelector } from "./components/variant-selector";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;

  const { slug } = params;

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

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;

  const { slug } = params;

  const region = await getCurrentRegion();
  const accessToken = await getAccessToken();

  const serviceOpts = {
    channel: region.market.channel,
    languageCode: region.language.code,
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    countryCode: region.market.countryCode,
  };
  const checkoutId = (await cookies()).get(COOKIE_KEY.checkoutId)?.value;

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

  return (
    <div className="mx-auto">
      <div className="my-6 grid gap-4 xs:mx-8 md:grid-cols-6 xl:grid-cols-12">
        <div className="relative col-start-1 max-md:hidden md:col-end-4 xl:col-end-7 [&>*]:pb-2">
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

        <section className="xl py-8 md:col-start-4 md:col-end-7 md:p-8 xl:col-start-7 xl:col-end-13 xl:px-24">
          <h1 className="text-2xl text-black">{name}</h1>

          <VariantSelector
            cart={cart}
            availability={availability}
            variants={variants}
            user={user ? { ...user, accessToken } : null}
          />

          <RichText className="py-8" jsonStringData={description} />
        </section>
      </div>
      <JsonLd jsonLd={productToJsonLd(product, availability)} />
    </div>
  );
}
