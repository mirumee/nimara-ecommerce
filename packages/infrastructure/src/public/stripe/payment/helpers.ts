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

export const getGatewayCustomerMetaKey = ({
  gateway,
  channel,
}: {
  channel: string;
  gateway: "stripe";
}) => `${gateway}.customer.${channel}`;

/**
 * This function maps Stripe error codes to App error codes.
 * @param code - The Stripe error code to be mapped.
 * @returns The mapped App error code.
 */
export const mapStripeErrorCode = (error: StripeError): AppErrorCode => {
  switch (error.code) {
    case "expired_card":
    case "incorrect_cvc":
    case "card_declined":
      return "GENERIC_CARD_ERROR";

    case "processing_error":
      return "PAYMENT_PROCESSING_ERROR";

    default:
      console.warn(
        "Unhandled Stripe error code, defaulting to UNKNOWN_ERROR",
        error.code,
      );

      return "GENERIC_PAYMENT_ERROR";
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
