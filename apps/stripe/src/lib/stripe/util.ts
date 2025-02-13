import type Stripe from "stripe";

import {
  type TransactionActionEnum,
  type TransactionEventTypeEnum,
  type TransactionFlowStrategyEnum,
} from "@nimara/codegen/schema";

import { CONFIG } from "@/config";

import {
  StripeMetaKey,
  type SupportedStripeWebhookEvent,
  type SupportedStripeWebhookEventType,
} from "./const";

type OptionalKeys = Omit<
  typeof StripeMetaKey,
  "ENVIRONMENT" | "ISSUER"
>[keyof Omit<typeof StripeMetaKey, "ENVIRONMENT" | "ISSUER">];

export const getGatewayMetadata = (
  metadata: Partial<Record<OptionalKeys, string>>,
) => ({
  [StripeMetaKey.ENVIRONMENT]: CONFIG.ENVIRONMENT,
  [StripeMetaKey.ISSUER]: CONFIG.APP_ID,
  ...metadata,
});

export const mapStatusToActionType = ({
  actionType,
  status,
}: {
  actionType: TransactionFlowStrategyEnum;
  status: Stripe.PaymentIntent["status"];
}) => {
  const map = {
    processing: `${actionType}_REQUEST`,
    requires_payment_method: `${actionType}_ACTION_REQUIRED`,
    requires_action: `${actionType}_ACTION_REQUIRED`,
    requires_confirmation: `${actionType}_ACTION_REQUIRED`,
    canceled: `${actionType}_FAILURE`,
    succeeded: `${actionType}_SUCCESS`,
    requires_capture: "AUTHORIZATION_SUCCESS",
  };

  return map[status] ?? "UNKNOWN";
};

export const getIntentDashboardUrl = ({
  paymentId,
  secretKey,
}: {
  paymentId: string;
  secretKey: string;
}) => {
  const prefix = secretKey.includes("test") ? "/test" : "";

  return `https://dashboard.stripe.com/${prefix}payments/${paymentId}`;
};

const getAvailableActionsForType = (
  eventType: TransactionEventTypeEnum | "UNKNOWN",
): TransactionActionEnum[] => {
  switch (eventType) {
    case "CHARGE_SUCCESS":
      return ["REFUND"];
    case "CHARGE_FAILURE":
      return ["CHARGE", "CANCEL"];
    case "AUTHORIZATION_ADJUSTMENT":
      return ["CANCEL"];
    default:
      return [];
  }
};

const getRefundUpdatedEventType = (
  intent: Stripe.Refund,
): TransactionEventTypeEnum | "UNKNOWN" => {
  switch (intent.status) {
    case "canceled":
      return "REFUND_FAILURE";
    case "processing":
    case "requires_action":
      return "REFUND_REQUEST";
    case "succeeded":
      return "REFUND_SUCCESS";
    default:
      return "UNKNOWN";
  }
};

export const mapStripeEventToSaleorEvent = (
  event: SupportedStripeWebhookEvent,
): {
  availableActions: TransactionActionEnum[];
  type: TransactionEventTypeEnum | "UNKNOWN";
} => {
  const stripeObject = event.data.object as
    | Stripe.PaymentIntent
    | Stripe.Refund;
  // @ts-expect-error Refund has no capture_method
  const isManualCapture = stripeObject?.capture_method === "manual";

  const eventTypeMapping: Partial<
    Record<
      SupportedStripeWebhookEventType,
      TransactionEventTypeEnum | "UNKNOWN"
    >
  > = {
    "payment_intent.succeeded": isManualCapture
      ? "AUTHORIZATION_SUCCESS"
      : "CHARGE_SUCCESS",
    "payment_intent.processing": isManualCapture
      ? "AUTHORIZATION_REQUEST"
      : "CHARGE_REQUEST",
    "payment_intent.payment_failed": isManualCapture
      ? "AUTHORIZATION_FAILURE"
      : "CHARGE_FAILURE",
    "payment_intent.created": isManualCapture
      ? "AUTHORIZATION_ACTION_REQUIRED"
      : "CHARGE_ACTION_REQUIRED",
    "payment_intent.canceled": isManualCapture
      ? "AUTHORIZATION_FAILURE"
      : "CHARGE_FAILURE",
    "payment_intent.partially_funded": "INFO",
    "payment_intent.amount_capturable_updated": "AUTHORIZATION_ADJUSTMENT",
    "payment_intent.requires_action": isManualCapture
      ? "AUTHORIZATION_ACTION_REQUIRED"
      : "CHARGE_ACTION_REQUIRED",
    "charge.refunded": "REFUND_SUCCESS",
    "charge.refund.updated": getRefundUpdatedEventType(
      stripeObject as Stripe.Refund,
    ),
  };

  const resolvedEventType =
    eventTypeMapping[event.type as SupportedStripeWebhookEventType] ??
    "UNKNOWN";
  const availableActions = getAvailableActionsForType(resolvedEventType);

  return {
    type: resolvedEventType,
    availableActions: availableActions,
  };
};
