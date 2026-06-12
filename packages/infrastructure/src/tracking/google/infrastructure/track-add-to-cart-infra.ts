import type { TrackAddToCartProvider } from "#root/use-cases/tracking/types/add-to-cart";

import { pushDataLayer } from "../helpers/push-data-layer";

/**
 * Reference: https://developers.google.com/tag-platform/gtagjs/reference/events#add_to_cart
 */
export const gtmTrackAddToCartInfra = (): TrackAddToCartProvider => ({
  async track({ product, price, quantity }) {
    pushDataLayer({
      event: "add_to_cart",
      ecommerce: {
        currency: price.currency,
        value: price.amount * quantity,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: price.amount,
            quantity,
          },
        ],
      },
    });
  },
});
