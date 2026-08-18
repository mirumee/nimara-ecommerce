import { type SaleorMetadataItem } from "@/lib/saleor/metadata";

// The Saleor user a payment-method request is scoped to.
export type PaymentMethodUser = {
  email: string;
  firstName?: string | null;
  id: string;
  lastName?: string | null;
  privateMetadata: readonly SaleorMetadataItem[];
};

/**
 * The user's identity at the payment gateway. `get`/`save` operate on the
 * mapping storage (Saleor user private metadata today); `create` mints the
 * customer at the gateway. The orchestrator owns the sequence:
 * get → miss → create → save.
 */
export type CustomerRepository = {
  create(opts: { user: PaymentMethodUser }): Promise<string>;
  get(opts: { user: PaymentMethodUser }): Promise<string | null>;
  save(opts: { gatewayUserId: string; userId: string }): Promise<void>;
};
