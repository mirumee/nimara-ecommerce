import {
  type Product,
  type ProductAvailability,
} from "@nimara/domain/objects/Product";

import { CACHE_TTL } from "@/config";
import { getCheckoutId } from "@/lib/actions/cart";
import { getCurrentRegion } from "@/regions/server";
import { getCartService } from "@/services/cart";

import { ProductMedia } from "./product-media";

type ProductMediaWrapperProps = {
  availability: ProductAvailability;
  product: Product;
  showAs?: "vertical" | "carousel";
};

export const ProductMediaWrapper = async ({
  product,
  availability,
  showAs,
}: ProductMediaWrapperProps) => {
  const [region, checkoutId, cartService] = await Promise.all([
    getCurrentRegion(),
    getCheckoutId(),
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

  const cart = resultCartGet?.ok ? resultCartGet.data : null;

  return (
    <ProductMedia
      product={product}
      media={product.images}
      variants={product.variants}
      availability={availability}
      cart={cart}
      showAs={showAs}
    />
  );
};
