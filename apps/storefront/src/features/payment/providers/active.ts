/**
 * This and `@/services/lazy-loaders/payment` are the only files that name a
 * gateway; swapping provider means editing both.
 */
export { StripePaymentElement as ActivePaymentElement } from "./stripe/stripe-payment-element";
export { StripeSetupElement as ActiveSetupElement } from "./stripe/stripe-setup-element";
export type { StripeMethodSessionData as ActiveMethodSession } from "@nimara/infrastructure/payment/stripe/types";
