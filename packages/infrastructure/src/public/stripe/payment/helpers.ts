import type { TransactionEventTypeEnum } from "@nimara/codegen/schema";
import type { Checkout } from "@nimara/domain/objects/Checkout";
import {
  type AppErrorCode,
  type PaymentError,
  type PaymentErrorType,
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

export const parseApiError =
  (type: PaymentErrorType) =>
  (error: { code: AppErrorCode }): PaymentError => ({
    type,
    code: error.code,
  });

export const getGatewayCustomerMetaKey = ({
  gateway,
  channel,
}: {
  channel: string;
  gateway: "stripe";
}) => `${gateway}.customer.${channel}`;
