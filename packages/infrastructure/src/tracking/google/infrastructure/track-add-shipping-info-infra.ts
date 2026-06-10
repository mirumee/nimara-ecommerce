import type { TrackAddShippingInfoProvider } from "#root/use-cases/tracking/types/add-shipping-info";

import { pushDataLayer } from "../helpers/push-data-layer";

/**
 * Reference: https://developers.google.com/tag-platform/gtagjs/reference/events#add_shipping_info
 */
export const gtmTrackAddShippingInfoInfra =
  (): TrackAddShippingInfoProvider => ({
    async track({ checkout }) {
      pushDataLayer({
        event: "add_shipping_info",
        ecommerce: {
          currency: checkout.totalPrice.gross.currency,
          value: checkout.totalPrice.gross.amount,
          ...(checkout.voucherCode ? { coupon: checkout.voucherCode } : {}),
          ...(checkout.deliveryMethod?.name
            ? { shipping_tier: checkout.deliveryMethod.name }
            : {}),
          items: checkout.lines.map((line) => ({
            item_id: line.product.id,
            item_name: line.product.name,
            price: line.total.amount / line.quantity,
            quantity: line.quantity,
          })),
        },
      });
    },
  });
