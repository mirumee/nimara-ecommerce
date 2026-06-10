import type { Checkout } from "@nimara/domain/objects/Checkout";

import type { TrackingProvider } from "./provider";

export type TrackAddPaymentInfoInput = {
  checkout: Checkout;
  paymentType?: string;
};

export type TrackAddPaymentInfoProvider =
  TrackingProvider<TrackAddPaymentInfoInput>;
