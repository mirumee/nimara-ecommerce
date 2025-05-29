import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { getAccessToken } from "@/auth";
import { CACHE_TTL, COOKIE_KEY } from "@/config";
import { clientEnvs } from "@/envs/client";
import { JsonLd, productToJsonLd } from "@/lib/json-ld";
import { getCurrentRegion } from "@/regions/server";
import { cartService } from "@/services/cart";
import { storefrontLogger } from "@/services/logging";
import { storeService } from "@/services/store";
import { userService } from "@/services/user";

import { ProductDetails } from "./product-details";

export const ProductDetailsContainer = async ({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) => {
  const { slug } = await params;

  const [region, accessToken, checkoutId] = await Promise.all([
    getCurrentRegion(),
    getAccessToken(),
    (async () => (await cookies()).get(COOKIE_KEY.checkoutId)?.value)(),
  ]);

  const serviceOpts = {
    channel: region.market.channel,
    languageCode: region.language.code,
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    countryCode: region.market.countryCode,
    logger: storefrontLogger,
  };

  const [{ data }, resultCartGet, resultUserGet] = await Promise.all([
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
          options: {
            next: {
              revalidate: CACHE_TTL.cart,
              tags: [`CHECKOUT:${checkoutId}`],
            },
          },
        })
      : null,
    userService.userGet(accessToken),
  ]);

  if (!data || !data.product) {
    notFound();
  }

  const user = resultUserGet.ok ? resultUserGet.data : null;
  const cart = resultCartGet?.ok ? resultCartGet.data : null;
  const { product, availability } = data;

  return (
    <>
      <ProductDetails
        product={product}
        availability={availability}
        cart={cart}
        user={user ? { ...user, accessToken } : null}
      />
      <JsonLd jsonLd={productToJsonLd(data?.product, data?.availability)} />
    </>
  );
};
