import type { TrackRemoveFromCartProvider } from "#root/use-cases/tracking/types/remove-from-cart";

import { pushDataLayer } from "../helpers/push-data-layer";

/**
 * Reference: https://developers.google.com/tag-platform/gtagjs/reference/events#remove_from_cart
 */
export const gtmTrackRemoveFromCartInfra = (): TrackRemoveFromCartProvider => ({
  async track({ line }) {
    pushDataLayer({
      event: "remove_from_cart",
      ecommerce: {
        currency: line.total.currency,
        value: line.total.amount,
        items: [
          {
            item_id: line.product.id,
            item_name: line.product.name,
            price: line.total.amount / line.quantity,
            quantity: line.quantity,
          },
        ],
      },
    });
  },
});
