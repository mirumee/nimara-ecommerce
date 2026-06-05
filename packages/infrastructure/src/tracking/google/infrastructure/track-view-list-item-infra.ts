import type { TrackViewListItemProvider } from "#root/use-cases/tracking/types/view-list-item";

import { pushDataLayer } from "../helpers/push-data-layer";

/**
 * Reference: https://developers.google.com/tag-platform/gtagjs/reference/events#view_item_list
 */
export const gtmTrackViewListItemInfra = (): TrackViewListItemProvider => ({
  async track({ listId, listName, items }) {
    pushDataLayer({
      event: "view_item_list",
      ecommerce: {
        item_list_id: listId,
        item_list_name: listName,
        items: items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price.amount,
          currency: item.currency,
        })),
      },
    });
  },
});
