import type { TrackPurchaseProvider } from "#root/use-cases/tracking/types/purchase";

import { pushDataLayer } from "../helpers/push-data-layer";

/**
 * Reference: https://developers.google.com/tag-platform/gtagjs/reference/events#purchase
 */
export const gtmTrackPurchaseInfra = (): TrackPurchaseProvider => ({
  async track({ checkout, orderId }) {
    pushDataLayer({
      event: "purchase",
      ecommerce: {
        transaction_id: orderId,
        currency: checkout.totalPrice.gross.currency,
        value: checkout.totalPrice.gross.amount,
        tax: checkout.totalPrice.tax.amount,
        shipping: checkout.shippingPrice.gross.amount,
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
