import type { TrackSelectItemProvider } from "#root/use-cases/tracking/types/select-item";

import { pushDataLayer } from "../helpers/push-data-layer";

/**
 * Reference: https://developers.google.com/tag-platform/gtagjs/reference/events#select_item
 */
export const gtmTrackSelectItemInfra = (): TrackSelectItemProvider => ({
  async track({ listId, listName, product }) {
    pushDataLayer({
      event: "select_item",
      ecommerce: {
        item_list_id: listId,
        item_list_name: listName,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: product.price.amount,
            currency: product.currency,
          },
        ],
      },
    });
  },
});
