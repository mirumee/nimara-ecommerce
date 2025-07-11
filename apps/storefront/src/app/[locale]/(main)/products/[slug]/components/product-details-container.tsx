import { notFound } from "next/navigation";

import { getAccessToken } from "@/auth";
import { CACHE_TTL } from "@/config";
import { clientEnvs } from "@/envs/client";
import { getCheckoutId } from "@/lib/actions/cart";
import { JsonLd, productToJsonLd } from "@/lib/json-ld";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { type SupportedLocale } from "@/regions/types";
import { cartService } from "@/services/cart";
import { lazyLoadService } from "@/services/import";
import { storefrontLogger } from "@/services/logging";

import { Breadcrumbs } from "../../../_components/breadcrumbs";
import { ProductDetails } from "./product-details";

type PageProps = {
  params: Promise<{ locale: SupportedLocale; slug: string }>;
};

export const ProductDetailsContainer = async (props: PageProps) => {
  const [{ slug }, region, accessToken, checkoutId, storeService, userService] =
    await Promise.all([
      props.params,
      getCurrentRegion(),
      getAccessToken(),
      getCheckoutId(),
      lazyLoadService("STORE"),
      lazyLoadService("USER"),
    ]);

  const serviceOpts = {
    channel: region.market.channel,
    languageCode: region.language.code,
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    countryCode: region.market.countryCode,
    logger: storefrontLogger,
  };

  const [{ data }, resultCartGet, resultUserGet] = await Promise.all([
    storeService.getProductDetails({
      productSlug: slug,
      countryCode: region.market.countryCode,
      channel: region.market.channel,
      languageCode: region.language.code,
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

  const productCrumbs = product.category
    ? [
        {
          label: product.category.name,
          href: paths.search.asPath({
            query: {
              category: product.category.slug,
            },
          }),
        },
      ]
    : undefined;

  return (
    <>
      <Breadcrumbs crumbs={productCrumbs} pageName={product.name} />
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
