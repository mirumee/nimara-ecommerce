import type {
  Stripe as StripeClient,
  StripeElements,
  StripePaymentElement,
} from "@stripe/stripe-js";

import type { Checkout } from "@nimara/domain/objects/Checkout";
import type { PaymentMethod } from "@nimara/domain/objects/Payment";
import { type AsyncResult, type Result } from "@nimara/domain/objects/Result";
import type { User } from "@nimara/domain/objects/User";

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

export type PaymentServiceConfig = {
  apiURI: string;
  environment: string;
  gatewayAppId: string;
  logger: Logger;
  publicKey: string;
  secretKey: string;
};

export type PaymentServiceState<S extends object> = Partial<
  S & { amount: number; id: string }
>;

export type PaymentInitializeUseCase = () => Promise<void>;

export type PaymentGatewayInitializeInfra = (opts: {
  amount: number;
  id: string;
}) => AsyncResult<{ success: true }>;

export type PaymentGatewayInitializeUseCase = PaymentGatewayInitializeInfra;

export type TransactionInitializeInfra = (opts: {
  amount: number;
  customerId?: Maybe<string>;
  id: string;
  paymentMethod?: Maybe<string>;
  saveForFutureUse?: Maybe<boolean>;
}) => AsyncResult<{ clientSecret: string }>;

export type PaymentExecuteInfra = (opts: {
  billingDetails: BillingDetails;
  paymentSecret?: Maybe<string>;
  redirectUrl: string;
}) => AsyncResult<{ success: true }>;

export type PaymentExecuteUseCase = PaymentExecuteInfra;

export type PaymentElementCreateInfra = (opts: {
  locale?: string;
  secret: string;
}) => Promise<{
  mount: (targetSelector: string) => void;
  unmount: () => void;
}>;

export type PaymentElementCreateUseCase = PaymentElementCreateInfra;

export type ClientInitializeInfra = () => Promise<void>;

export type PaymentProcessUseCase = (opts: {
  checkout: Checkout;
  searchParams: Record<string, string>;
}) => AsyncResult<{ success: boolean }>;

export type PaymentResultProcessInfra = (opts: {
  checkout: Checkout;
}) => AsyncResult<{ isCheckoutPaid: boolean }>;

export type TransactionProcessInfra = (opts: {
  searchParams: Record<string, string>;
}) => AsyncResult<{ success: boolean }>;

export type BillingDetails = Partial<{
  country: string;
  email: string;
  name: string;
  postalCode: string;
  state: string;
  streetAddress1: string;
  streetAddress2: string;
}>;

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
