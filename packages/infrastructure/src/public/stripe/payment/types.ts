import type {
  Stripe as StripeClient,
  StripeElements,
  StripePaymentElement,
} from "@stripe/stripe-js";

import type { Checkout } from "@nimara/domain/objects/Checkout";
import type { PaymentMethod } from "@nimara/domain/objects/Payment";
import type { User } from "@nimara/domain/objects/User";

import type { Maybe } from "#root/lib/types";

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
}) => Promise<{
  errors: ApiError[];
}>;

export type PaymentGatewayInitializeUseCase = PaymentGatewayInitializeInfra;

export type TransactionInitializeInfra = (opts: {
  amount: number;
  customerId?: Maybe<string>;
  id: string;
  paymentMethod?: Maybe<string>;
  saveForFutureUse?: Maybe<boolean>;
}) => Promise<
  { data: string; errors: never[] } | { data: null; errors: ApiError[] }
>;

export type PaymentExecuteInfra = (opts: {
  billingDetails: BillingDetails;
  paymentSecret?: Maybe<string>;
  redirectUrl: string;
}) => Promise<{
  errors: ApiError[];
  isSuccess: boolean;
}>;

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
}) => Promise<{
  errors: ApiError[];
  isSuccess: boolean;
}>;

export type PaymentResultProcessInfra = (opts: {
  checkout: Checkout;
}) => Promise<{ errors: ApiError[]; isSuccess: boolean }>;

export type TransactionProcessInfra = (opts: {
  searchParams: Record<string, string>;
}) => Promise<{ errors: ApiError[]; isSuccess: boolean }>;

export type BillingDetails = Partial<{
  country: string;
  email: string;
  name: string;
  postalCode: string;
  state: string;
  streetAddress1: string;
  streetAddress2: string;
}>;

export type ApiErrorType =
  | "paymentInitialize"
  | "transactionInitialize"
  | "transactionProcess"
  | "stripe"
  | "adyen";

export type ApiError = {
  code: string;
  type: ApiErrorType;
};

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
) => Promise<GatewayUser | null>;

export type CustomerFromSaleorGetInfra = (opts: {
  channel: string;
  user: User;
}) => string | null;

export type CustomerInGatewayCreateInfra = (opts: {
  environment: string;
  user: User;
}) => Promise<GatewayUser>;

export type CustomerInSaleorSaveInfra = (opts: {
  accessToken: string;
  channel: string;
  gatewayCustomerId: string;
  saleorCustomerId: string;
}) => Promise<void>;

export type CustomerGetUseCase = (opts: {
  accessToken: string;
  channel: string;
  environment: string;
  user: User;
}) => Promise<null | string>;

export type PaymentMethodsListInfra = (opts: {
  customerId: string;
}) => Promise<PaymentMethod[]>;

export type CustomerPaymentMethodsListUseCase = PaymentMethodsListInfra;

export type PaymentMethodDetachInfra = (opts: {
  paymentMethodId: string;
}) => Promise<void>;

export type CustomerPaymentMethodValidate = (opts: {
  customerId: string;
  paymentMethodId: string;
}) => Promise<{ isCustomerPaymentMethod: boolean }>;

export type CustomerPaymentMethodDeleteUseCase = (opts: {
  customerId: string;
  paymentMethodId: string;
}) => Promise<{ isSuccess: boolean }>;

export type PaymentSaveInitializeInfra = (opts: {
  customerId: string;
}) => Promise<{ secret: string }>;

export type PaymentSaveInitializeUseCase = PaymentSaveInitializeInfra;

export type PaymentMethodSaveProcessInfra = ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) => Promise<{ customerId: string; paymentMethodId: string } | void>;

export type PaymentMethodSaveProcessUseCase = ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) => Promise<{ isSuccess: boolean }>;

export type PaymentMethodSetDefaultInfra = (opts: {
  customerId: string;
  paymentMethodId: string;
}) => Promise<void>;

export type PaymentMethodSaveExecuteInfra = (opts: {
  redirectUrl: string;
  saveForFutureUse?: boolean;
}) => Promise<{
  errors: ApiError[];
  isSuccess: boolean;
}>;

export type PaymentMethodSaveExecuteUseCase = PaymentMethodSaveExecuteInfra;
