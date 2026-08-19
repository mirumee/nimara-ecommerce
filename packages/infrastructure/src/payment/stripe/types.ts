import { type Stripe, type StripeElements } from "@stripe/stripe-js";

import type {
  MethodSessionData,
  PaymentExecuteInfra,
  PaymentGatewayInitializeInfra,
  PaymentInitializeInfra,
  PaymentMethodExecuteInfra,
  PaymentMethodInitializeInfra,
  PaymentService,
  PaymentSessionData,
} from "../types";

/**
 * Apps reach Stripe through this layer rather than depending on
 * `@stripe/stripe-js` directly.
 */
export type {
  Appearance,
  Stripe,
  StripeElementLocale,
  StripeElements,
  StripePaymentElement,
  StripePaymentElementOptions,
} from "@stripe/stripe-js";

export type {
  BillingDetails,
  PaymentDetails,
  PaymentOutcome,
  ProcessData,
} from "../types";

export type StripeGateway = {
  sdk: Stripe;
};

export type StripeGatewayConfig = {
  publishableKey: string;
};

export type StripePaymentSession = {
  clientSecret: string;
};

export type StripeMethodSession = {
  clientSecret: string;
};

export type StripeProvider = {
  element: StripeElements;
  gateway: StripeGateway;
  gatewayConfig: StripeGatewayConfig;
  methodSession: StripeMethodSession;
  paymentSession: StripePaymentSession;
};

export type StripePaymentSessionData = PaymentSessionData<StripeProvider>;

export type StripeMethodSessionData = MethodSessionData<StripeProvider>;

export type StripePaymentService = PaymentService<StripeProvider>;

export type StripePaymentGatewayInitializeInfra =
  PaymentGatewayInitializeInfra<StripeProvider>;

export type StripePaymentInitializeInfra =
  PaymentInitializeInfra<StripeProvider>;

export type StripePaymentExecuteInfra = PaymentExecuteInfra<StripeProvider>;

export type StripePaymentMethodInitializeInfra =
  PaymentMethodInitializeInfra<StripeProvider>;

export type StripePaymentMethodExecuteInfra =
  PaymentMethodExecuteInfra<StripeProvider>;
