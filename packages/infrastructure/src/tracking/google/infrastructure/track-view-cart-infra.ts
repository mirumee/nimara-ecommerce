import type { TrackViewCartProvider } from "#root/use-cases/tracking/types/view-cart";

import { pushDataLayer } from "../helpers/push-data-layer";

/**
 * Reference: https://developers.google.com/tag-platform/gtagjs/reference/events#view_cart
 */
export const gtmTrackViewCartInfra = (): TrackViewCartProvider => ({
  async track({ cart }) {
    pushDataLayer({
      event: "view_cart",
      ecommerce: {
        currency: cart.total.currency,
        value: cart.total.amount,
        items: cart.lines.map((line) => ({
          item_id: line.product.id,
          item_name: line.product.name,
          price: line.total.amount / line.quantity,
          quantity: line.quantity,
        })),
      },
    });
  },
});
