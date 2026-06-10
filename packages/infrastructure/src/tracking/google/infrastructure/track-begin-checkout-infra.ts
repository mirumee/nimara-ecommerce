import type { TrackBeginCheckoutProvider } from "#root/use-cases/tracking/types/begin-checkout";

import { pushDataLayer } from "../helpers/push-data-layer";

/**
 * Reference: https://developers.google.com/tag-platform/gtagjs/reference/events#begin_checkout
 */
export const gtmTrackBeginCheckoutInfra = (): TrackBeginCheckoutProvider => ({
  async track({ checkout }) {
    pushDataLayer({
      event: "begin_checkout",
      ecommerce: {
        currency: checkout.totalPrice.gross.currency,
        value: checkout.totalPrice.gross.amount,
        ...(checkout.voucherCode ? { coupon: checkout.voucherCode } : {}),
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
