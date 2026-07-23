import type {
  Appearance,
  Stripe as StripeClient,
  StripeElements,
  StripePaymentElement,
  StripePaymentElementOptions,
} from "@stripe/stripe-js";

import type { Address } from "@nimara/domain/objects/Address";
import type { PaymentMethod } from "@nimara/domain/objects/Payment";
import { type AsyncResult, type Result } from "@nimara/domain/objects/Result";
import type { User } from "@nimara/domain/objects/User";

export type { StripeElements } from "@stripe/stripe-js";

export type InitializeData = {
  sdk: StripeClient;
};

export type TransactionData = {
  clientSecret: string;
  /**
   * Missing when the client secret does not originate from a Saleor
   * transaction (e.g. marketplace payment intents).
   */
  transaction?: {
    id: string;
  };
};

export type BillingDetails = Pick<
  Address,
  | "city"
  | "country"
  | "countryArea"
  | "firstName"
  | "lastName"
  | "postalCode"
  | "streetAddress1"
  | "streetAddress2"
>;

export type ExecuteData = {
  billingDetails?: BillingDetails;
  /**
   * Present when paying with a newly entered payment method (mounted payment
   * element). Absent when confirming with a tokenized saved method — the
   * confirmation then runs against `TransactionData.clientSecret` alone.
   */
  elements?: StripeElements;
  email: string;
  redirectUrl: string;
};

export type ProcessData = {
  /** Optional context forwarded to the payment app with the process event. */
  data?: unknown;
  transaction: {
    id: string;
  };
};

import type { Maybe } from "#root/lib/types";
import { type Logger } from "#root/logging/types";

export type StripeServiceState = PaymentServiceState<{
  amount: number;
  clientSDK: StripeClient;
  customerId: Maybe<string>;
  elements: StripeElements;
  id: string;
  paymentElement: StripePaymentElement;
  transactionId: string;
}>;

/**
 * Config of the stateless payment service. Browser-safe — no secret key; the
 * service runs on Saleor mutations and the client-side Stripe SDK only.
 */
export type PaymentServiceConfig = {
  apiURI: string;
  gatewayAppId: string;
  logger: Logger;
  publicKey: string;
};

export type LegacyPaymentServiceConfig = PaymentServiceConfig & {
  environment: string;
  secretKey: string;
};

export type PaymentServiceState<S extends object> = Partial<
  S & { amount: number; id: string }
>;

export type PaymentInitializeUseCase = () => Promise<void>;

export type PaymentElementCreateInfra = (opts: {
  appearance?: Appearance;
  locale?: string;
  options?: StripePaymentElementOptions;
  secret: string;
}) => Promise<{
  mount: (targetSelector: string) => void;
  unmount: () => void;
}>;

export type PaymentElementCreateUseCase = PaymentElementCreateInfra;

export type ClientInitializeInfra = () => Promise<void>;

export type GatewayUser = {
  defaultPaymentMethodId: string | null;
  id: string;
};

export type CustomerFromGatewayGetInfra = (
  opts:
    | {
        environment: string;
        gatewayId?: never;
        user: User;
      }
    | {
        environment?: never;
        gatewayId: string;
        user?: never;
      },
) => AsyncResult<GatewayUser>;

export type CustomerFromSaleorGetInfra = (opts: {
  channel: string;
  user: User;
}) => Result<string | null>;

export type CustomerInGatewayCreateInfra = (opts: {
  environment: string;
  user: User;
}) => AsyncResult<GatewayUser>;

export type CustomerInSaleorSaveInfra = (opts: {
  accessToken: string;
  channel: string;
  gatewayCustomerId: string;
  saleorCustomerId: string;
}) => AsyncResult<{ success: true }>;

export type CustomerGetUseCase = (opts: {
  accessToken: string;
  channel: string;
  environment: string;
  user: User;
}) => AsyncResult<{ customerId: string }>;

export type PaymentMethodsListInfra = (opts: {
  customerId: string;
}) => AsyncResult<PaymentMethod[]>;

export type CustomerPaymentMethodsListUseCase = PaymentMethodsListInfra;

export type PaymentMethodDetachInfra = (opts: {
  paymentMethodId: string;
}) => AsyncResult<{ success: true }>;

export type CustomerPaymentMethodValidate = (opts: {
  customerId: string;
  paymentMethodId: string;
}) => AsyncResult<{ isCustomerPaymentMethod: boolean }>;

export type CustomerPaymentMethodDeleteUseCase = (opts: {
  customerId: string;
  paymentMethodId: string;
}) => AsyncResult<{ success: true }>;

export type PaymentSaveInitializeInfra = (opts: {
  customerId: string;
}) => AsyncResult<{ secret: string }>;

export type PaymentSaveInitializeUseCase = PaymentSaveInitializeInfra;

export type PaymentMethodSaveProcessInfra = ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) => AsyncResult<{ customerId: string; paymentMethodId: string }>;

export type PaymentMethodSaveProcessUseCase = ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) => AsyncResult<{ success: true }>;

export type PaymentMethodSetDefaultInfra = (opts: {
  customerId: string;
  paymentMethodId: string;
}) => AsyncResult<{ success: true }>;

export type PaymentMethodSaveExecuteInfra = (opts: {
  redirectUrl: string;
  saveForFutureUse?: boolean;
}) => AsyncResult<{ success: true }>;

export type PaymentMethodSaveExecuteUseCase = PaymentMethodSaveExecuteInfra;
