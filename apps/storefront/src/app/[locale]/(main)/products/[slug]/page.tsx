import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { getAccessToken } from "@/auth";
import { CACHE_TTL, COOKIE_KEY } from "@/config";
import { clientEnvs } from "@/envs/client";
import { JsonLd, productToJsonLd } from "@/lib/json-ld";
import { getCurrentRegion } from "@/regions/server";
import { cartService, storeService, userService } from "@/services";

import { ProductDisplay } from "./components/product-display";

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

  return (
    <div>
      <ProductDisplay
        cart={cart}
        product={data.product}
        availability={data.availability}
        user={user ? { ...user, accessToken } : null}
      />

      <JsonLd jsonLd={productToJsonLd(data?.product, data?.availability)} />
    </div>
  );
}
