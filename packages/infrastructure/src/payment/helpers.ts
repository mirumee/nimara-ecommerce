import { type StripeError } from "@stripe/stripe-js";
import { type NonEmptyArray } from "ts-essentials";

import type { TransactionEventTypeEnum } from "@nimara/codegen/schema";
import type { Checkout } from "@nimara/domain/objects/Checkout";
import {
  type AppErrorCode,
  type BaseError,
} from "@nimara/domain/objects/Error";

type EventType = `${TransactionEventTypeEnum}`;

export const isCheckoutPaid = (checkout: Checkout) =>
  [checkout.authorizeStatus, checkout.chargeStatus].includes("FULL") ||
  [checkout.authorizeStatus, checkout.chargeStatus].includes("OVERCHARGED");

const SUCCESSFUL_TRANSACTION_EVENT_TYPES: EventType[] = [
  "AUTHORIZATION_SUCCESS",
  "CHARGE_SUCCESS",
];

export const isTransactionSuccessful = (
  eventType: EventType | null | undefined,
) => !!eventType && SUCCESSFUL_TRANSACTION_EVENT_TYPES.includes(eventType);

export const isTransactionFailed = (eventType: EventType | null | undefined) =>
  !!eventType?.endsWith("FAILURE");

export const isTransactionActionRequired = (
  eventType: EventType | null | undefined,
) => !!eventType?.endsWith("ACTION_REQUIRED");

export const getGatewayCustomerMetaKey = ({
  gateway,
  channel,
}: {
  channel: string;
  gateway: "stripe";
}) => `${gateway}.customer.${channel}`;

/**
 * Maps a Stripe error to an App error code, by the error type first and the
 * detailed error code within it.
 */
export const mapStripeErrorCode = (error: StripeError): AppErrorCode => {
  switch (error.type) {
    case "validation_error":
      return "PAYMENT_VALIDATION_ERROR";

    case "invalid_request_error":
      switch (error.code) {
        case "payment_intent_authentication_failure":
          return "PAYMENT_PROCESSING_ERROR";
        case "expired_card":
        case "invalid_expiry_month":
        case "invalid_expiry_year":
        case "invalid_cvc":
          return "PAYMENT_VALIDATION_ERROR";
      }

      return "PAYMENT_EXECUTE_ERROR";

    case "card_error":
      return "GENERIC_CARD_ERROR";

    default:
      return "PAYMENT_EXECUTE_ERROR";
  }
};

/**
 * This function handles mutation errors returned from Stripe.
 * It maps Stripe error codes to App error codes and returns an array of App errors.
 * @param error - The Stripe error to be handled.
 * @returns An array of App errors.
 */
export const handleStripeErrors = (
  error: StripeError,
): NonEmptyArray<BaseError> => {
  return [
    {
      code: mapStripeErrorCode(error),
      message: error.message ?? "An unknown error occurred.",
      originalError: {
        code: error.code,
        message: error.message,
        type: error.type,
      },
    },
  ] as NonEmptyArray<BaseError>;
};
