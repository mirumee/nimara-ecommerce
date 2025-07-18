import { notFound } from "next/navigation";

import { getAccessToken } from "@/auth";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CACHE_TTL } from "@/config";
import { getCheckoutId } from "@/lib/actions/cart";
import { JsonLd, productToJsonLd } from "@/lib/json-ld";
import { paths } from "@/lib/paths";
import { ProductDetails } from "@/pdp/components/product-details";
import { getCurrentRegion } from "@/regions/server";
import { getCartService } from "@/services/cart";
import { getStoreService } from "@/services/store";
import { getUserService } from "@/services/user";

type Props = {
  slug: string;
};

export const ProductDetailsContainer = async ({ slug }: Props) => {
  const [region, accessToken, checkoutId, storeService, userService] =
    await Promise.all([
      getCurrentRegion(),
      getAccessToken(),
      getCheckoutId(),
      getStoreService(),
      getUserService(),
    ]);

  const [{ data }, resultUserGet, cartService] = await Promise.all([
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
    userService.userGet(accessToken),
    getCartService(),
  ]);

  const resultCartGet = checkoutId
    ? await cartService.cartGet({
        cartId: checkoutId,
        languageCode: region.language.code,
        countryCode: region.market.countryCode,
        options: {
          next: {
            revalidate: CACHE_TTL.cart,
            tags: [`CHECKOUT:${checkoutId}`],
          },
        },
      })
    : null;

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
