import {
  type Product,
  type ProductAvailability,
} from "@nimara/domain/objects/Product";

import { getSessionCart } from "@/lib/marketplace/session-cart";
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
  const [region, cartService] = await Promise.all([
    getCurrentRegion(),
    getCartService(),
  ]);

  const sessionCart = await getSessionCart({
    cartService,
    region,
  });

  return (
    <ProductMedia
      product={product}
      media={product.images}
      variants={product.variants}
      availability={availability}
      cart={sessionCart?.cart ?? null}
      showAs={showAs}
    />
  );
};
