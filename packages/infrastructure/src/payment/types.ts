import type { Address } from "@nimara/domain/objects/Address";
import type { PaymentMethod } from "@nimara/domain/objects/Payment";
import { type AsyncResult } from "@nimara/domain/objects/Result";

import { type FetchOptions } from "#root/graphql/client";
import type { Maybe } from "#root/lib/types";
import { type Logger } from "#root/logging/types";

// =============================================================================
// PROVIDER CONTRACT
// =============================================================================

/**
 * A provider fills this in, and every contract below is expressed in terms of
 * it, so no provider SDK is named in this module.
 */
export type PaymentProviderContract = {
  element: unknown;
  gateway: unknown;
  /**
   * Reported with every session, so the storefront holds no gateway keys and a
   * per-channel account works without redeploying it.
   */
  gatewayConfig: unknown;
  methodSession: unknown;
  paymentSession: unknown;
};

// =============================================================================
// SESSIONS
// =============================================================================

export type Transaction = {
  id: string;
};

export type PaymentSessionData<TProvider extends PaymentProviderContract> = {
  gatewayConfig: TProvider["gatewayConfig"];
  providerData: TProvider["paymentSession"];
  /**
   * Changes per session so neutral UI can remount on it. Never a credential.
   */
  sessionId: string;
  /**
   * Missing for sessions that are not Saleor transactions, such as marketplace
   * payment intents.
   */
  transaction?: Transaction;
};

export type MethodSessionData<TProvider extends PaymentProviderContract> = {
  gatewayConfig: TProvider["gatewayConfig"];
  id: string;
  providerData: TProvider["methodSession"];
};

// =============================================================================
// OPERATION DATA
// =============================================================================

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

export type PaymentDetails = {
  billingDetails?: BillingDetails;
  email: string;
  saveForFutureUse?: boolean;
};

export type ProcessData = {
  data?: unknown;
  transaction: Transaction;
};

export type PaymentInitializeOpts = {
  amount: number;
  id: string;
  paymentMethodId?: Maybe<string>;
  saveForFutureUse?: Maybe<boolean>;
  sharedPaymentToken?: Maybe<string>;
};

export type MethodOpts = {
  accessToken: string;
  channel: string;
  options?: FetchOptions;
};

/**
 * `null` means the provider settled the confirmation itself, including driving
 * its own redirect. A url means the caller has to navigate.
 */
export type PaymentOutcome = {
  nextAction: { redirectUrl: string } | null;
};

// =============================================================================
// PAYMENT OPERATIONS
// =============================================================================
export type PaymentGatewayInitializeInfra<
  TProvider extends PaymentProviderContract,
> = (opts: {
  gatewayConfig: TProvider["gatewayConfig"];
}) => AsyncResult<TProvider["gateway"]>;

export type PaymentInitializeInfra<TProvider extends PaymentProviderContract> =
  (opts: PaymentInitializeOpts) => AsyncResult<PaymentSessionData<TProvider>>;

export type PaymentExecuteInfra<TProvider extends PaymentProviderContract> =
  (opts: {
    details: PaymentDetails;
    initializeData: TProvider["gateway"];
    /**
     * Absent when paying with a stored method: nothing is mounted.
     */
    paymentElement?: TProvider["element"];
    redirectUrl: string;
    transactionData: PaymentSessionData<TProvider>;
  }) => AsyncResult<PaymentOutcome>;

export type PaymentProcessInfra = (
  opts: ProcessData,
) => AsyncResult<{ actionRequired: boolean; orderId?: string }>;

// =============================================================================
// PAYMENT METHOD OPERATIONS
// =============================================================================
export type PaymentMethodListInfra = (
  opts: MethodOpts,
) => AsyncResult<PaymentMethod[]>;

export type PaymentMethodDeleteInfra = (
  opts: { id: string } & MethodOpts,
) => AsyncResult<{ success: true }>;

export type PaymentMethodInitializeInfra<
  TProvider extends PaymentProviderContract,
> = (
  opts: { data?: unknown } & MethodOpts,
) => AsyncResult<MethodSessionData<TProvider>>;

export type PaymentMethodExecuteInfra<
  TProvider extends PaymentProviderContract,
> = (opts: {
  initializeData: TProvider["gateway"];
  methodSession: MethodSessionData<TProvider>;
  paymentElement: TProvider["element"];
  redirectUrl: string;
}) => AsyncResult<PaymentOutcome>;

export type PaymentMethodProcessInfra = (
  opts: {
    data?: unknown;
    id: string;
  } & MethodOpts,
) => AsyncResult<{ id: string }>;

// =============================================================================
// SERVICES
// =============================================================================
export type PaymentServiceConfig = {
  apiURI: string;
  gatewayAppId: string;
  logger: Logger;
};

/**
 * The half of the service that touches no provider UI, so server-side flows can
 * depend on it without naming a gateway.
 */
export type PaymentServerService = {
  paymentInitialize: (
    opts: PaymentInitializeOpts,
  ) => AsyncResult<{ transaction?: Transaction }>;
  paymentProcess: PaymentProcessInfra;
};

/**
 * Apps depend on this rather than a concrete provider, so adding a gateway is a
 * new implementation instead of an app-layer change.
 */
export type PaymentService<TProvider extends PaymentProviderContract> = {
  gatewayInitialize: PaymentGatewayInitializeInfra<TProvider>;
  methodDelete: PaymentMethodDeleteInfra;
  methodExecute: PaymentMethodExecuteInfra<TProvider>;
  methodInitialize: PaymentMethodInitializeInfra<TProvider>;
  methodList: PaymentMethodListInfra;
  methodProcess: PaymentMethodProcessInfra;
  paymentExecute: PaymentExecuteInfra<TProvider>;
  paymentInitialize: PaymentInitializeInfra<TProvider>;
  paymentProcess: PaymentProcessInfra;
};
