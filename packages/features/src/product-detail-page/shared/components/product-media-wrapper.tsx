import {
  type Product,
  type ProductAvailability,
} from "@nimara/domain/objects/Product";
import { type Region } from "@nimara/foundation/regions/types";
import { type ServiceRegistry } from "@nimara/infrastructure/types";

import { ProductMedia } from "./product-media";

type ProductMediaWrapperProps = {
  availability: ProductAvailability;
  checkoutId: string | null;
  product: Product;
  region: Region;
  services: ServiceRegistry;
  showAs?: "vertical" | "carousel";
};

export const ProductMediaWrapper = async ({
  product,
  availability,
  services,
  checkoutId,
  showAs,
  region,
}: ProductMediaWrapperProps) => {
  const cartService = await services.getCartService();
  const resultCartGet = checkoutId
    ? await cartService.cartGet({
        cartId: checkoutId,
        languageCode: region.language.code,
        countryCode: region.market.countryCode,
        options: {
          next: {
            revalidate: services.config.cacheTTL.cart,
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
