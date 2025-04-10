import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { getAccessToken } from "@/auth";
import { CACHE_TTL, COOKIE_KEY } from "@/config";
import { clientEnvs } from "@/envs/client";
import { JsonLd, productToJsonLd } from "@/lib/json-ld";
import { getCurrentRegion } from "@/regions/server";
import { cartService, storeService, userService } from "@/services";
import { storefrontLogger } from "@/services/logging";

import { ProductDetails } from "./product-details";

export const ProductDetailsContainer = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
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

  const [{ data }, cart, user] = await Promise.all([
    storeService(serviceOpts).getProductDetails({
      productSlug: slug,
      options: {
        next: {
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
