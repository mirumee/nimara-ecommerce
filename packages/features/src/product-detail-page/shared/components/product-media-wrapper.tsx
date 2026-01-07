import {
  type Product,
  type ProductAvailability,
} from "@nimara/domain/objects/Product";

import { ProductMedia } from "./product-media";
import { ServiceRegistry } from "@nimara/infrastructure/types";

type ProductMediaWrapperProps = {
  availability: ProductAvailability;
  product: Product;
  services: ServiceRegistry;
  checkoutId: string | null;
  showAs?: "vertical" | "carousel";
};

export const ProductMediaWrapper = async ({
  product,
  availability,
  services,
  checkoutId,
  showAs,
}: ProductMediaWrapperProps) => {


  const resultCartGet = checkoutId
    ? await services.cart.cartGet({
      cartId: checkoutId,
      languageCode: services.region.language.code,
      countryCode: services.region.market.countryCode,
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
