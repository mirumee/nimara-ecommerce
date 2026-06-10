import type { TrackViewItemProvider } from "#root/use-cases/tracking/types/view-item";

import { pushDataLayer } from "../helpers/push-data-layer";

/**
 * Reference: https://developers.google.com/tag-platform/gtagjs/reference/events#view_item
 */
export const gtmTrackViewItemInfra = (): TrackViewItemProvider => ({
  async track({ product, price }) {
    pushDataLayer({
      event: "view_item",
      ecommerce: {
        currency: price.currency,
        value: price.amount,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: price.amount,
          },
        ],
      },
    });
  },
});
