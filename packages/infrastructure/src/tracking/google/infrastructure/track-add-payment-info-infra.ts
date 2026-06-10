import type { TrackAddPaymentInfoProvider } from "#root/use-cases/tracking/types/add-payment-info";

import { pushDataLayer } from "../helpers/push-data-layer";

/**
 * Reference: https://developers.google.com/tag-platform/gtagjs/reference/events#add_payment_info
 */
export const gtmTrackAddPaymentInfoInfra = (): TrackAddPaymentInfoProvider => ({
  async track({ checkout, paymentType }) {
    pushDataLayer({
      event: "add_payment_info",
      ecommerce: {
        currency: checkout.totalPrice.gross.currency,
        value: checkout.totalPrice.gross.amount,
        ...(checkout.voucherCode ? { coupon: checkout.voucherCode } : {}),
        ...(paymentType ? { payment_type: paymentType } : {}),
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
