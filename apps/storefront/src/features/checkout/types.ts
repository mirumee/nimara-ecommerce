import { type Checkout } from "@nimara/domain/objects/Checkout";

export type MarketplaceCheckoutItem = {
  checkout: Checkout;
  checkoutId: string;
  vendorDisplayName: string;
  vendorKey: string;
};
