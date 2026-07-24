import { type AsyncResult } from "@nimara/domain/objects/Result";

import type { Maybe } from "#root/lib/types";

import type {
  ExecuteData,
  InitializeData,
  ProcessData,
  TransactionData,
} from "../types";

/**
 * Stripe types re-exported for app code. Apps consume Stripe through the
 * infrastructure layer and do not depend on `@stripe/stripe-js` directly.
 */
export type {
  Appearance,
  Stripe,
  StripeElementLocale,
  StripeElements,
  StripePaymentElement,
  StripePaymentElementOptions,
} from "@stripe/stripe-js";

/**
 * Shared payment data contracts live in the provider-neutral
 * `#root/payment/types` module; re-exported here for stripe-scoped consumers.
 */
export type {
  BillingDetails,
  ExecuteData,
  InitializeData,
  ProcessData,
  TransactionData,
} from "../types";

export type PaymentInitializeGatewayInfra = () => AsyncResult<InitializeData>;

export type PaymentInitializeTransactionInfra = (opts: {
  amount: number;
  customerId?: Maybe<string>;
  id: string;
  paymentMethod?: Maybe<string>;
  saveForFutureUse?: Maybe<boolean>;
  sharedPaymentToken?: Maybe<string>;
}) => AsyncResult<TransactionData>;

export type PaymentExecuteInfra = (opts: {
  data: ExecuteData;
  initializeData: InitializeData;
  transactionData: TransactionData;
}) => AsyncResult<{ success: true }>;

export type PaymentProcessInfra = (
  opts: ProcessData,
) => AsyncResult<{ actionRequired: boolean; orderId?: string }>;
