import { all } from "@/lib/misc";

import {
  type PaymentIntentStatus,
  type RefundStatus,
  StripeMetaKey,
  type StripeNotification,
  type SupportedStripeWebhookEventType,
  type TransactionAction,
  type TransactionEventType,
  type TransactionFlowStrategy,
} from "./consts";
import { type TransactionEventSchema } from "./payment";

type OptionalMetaKeys = Omit<
  typeof StripeMetaKey,
  "ENVIRONMENT" | "ISSUER"
>[keyof Omit<typeof StripeMetaKey, "ENVIRONMENT" | "ISSUER">];

// Whether a webhook was issued by this app instance (issuer + environment).
export const isAppEvent = ({
  appId,
  environment,
  metadata,
}: {
  appId: string;
  environment: string;
  metadata: Record<string, string>;
}) =>
  all([
    metadata[StripeMetaKey.ISSUER] === appId,
    metadata[StripeMetaKey.ENVIRONMENT] === environment,
  ]);

export const buildGatewayMetadata = ({
  appId,
  environment,
  metadata,
}: {
  appId: string;
  environment: string;
  metadata?: Partial<Record<OptionalMetaKeys, string>>;
}) => ({
  [StripeMetaKey.ENVIRONMENT]: environment,
  [StripeMetaKey.ISSUER]: appId,
  ...metadata,
});

export const mapStatusToActionType = ({
  actionType,
  status,
}: {
  actionType: TransactionAction | TransactionFlowStrategy;
  status: PaymentIntentStatus;
}) => {
  const map = {
    processing: `${actionType}_REQUEST`,
    requires_payment_method: `${actionType}_ACTION_REQUIRED`,
    requires_action: `${actionType}_ACTION_REQUIRED`,
    requires_confirmation: `${actionType}_ACTION_REQUIRED`,
    canceled: `${actionType}_FAILURE`,
    succeeded: `${actionType}_SUCCESS`,
    requires_capture: "AUTHORIZATION_SUCCESS",
  } as Record<string, TransactionEventSchema["result"]>;

  const mappedStatus = map[status];

  if (!mappedStatus) {
    throw new Error(`Cannot map ${status} to actionType ${actionType}.`);
  }

  return mappedStatus;
};

export const getIntentDashboardUrl = ({
  paymentId,
  secretKey,
}: {
  paymentId: string;
  secretKey: string;
}) => {
  const prefix = secretKey.includes("test") ? "test/" : "";

  return `https://dashboard.stripe.com/${prefix}payments/${paymentId}`;
};

const getAvailableActionsForType = (
  eventType: TransactionEventType,
): TransactionAction[] => {
  switch (eventType) {
    case "CHARGE_SUCCESS":
      return ["REFUND"];
    case "CHARGE_FAILURE":
    case "AUTHORIZATION_ADJUSTMENT":
      return ["CHARGE", "CANCEL"];
    default:
      return [];
  }
};

const getRefundUpdatedEventType = (
  status: RefundStatus | null,
): TransactionEventType | undefined => {
  switch (status) {
    case "succeeded":
      return "REFUND_SUCCESS";
    case "pending":
    case "requires_action":
      return "REFUND_REQUEST";
    case "canceled":
    case "failed":
      return "REFUND_FAILURE";
    default:
      return undefined;
  }
};

/**
 * Maps a Stripe event to the Saleor transaction event it should be reported
 * as. Returns `null` for event types the app does not handle (e.g. stale
 * subscriptions still configured on the Stripe webhook endpoint) — callers
 * acknowledge those without reporting.
 */
export const mapStripeEventToSaleorEvent = (
  notification: StripeNotification,
): {
  availableActions: TransactionAction[];
  type: TransactionEventType;
} | null => {
  const { isManualCapture } = notification;

  const eventTypeMapping: Partial<
    Record<SupportedStripeWebhookEventType, TransactionEventType>
  > = {
    "payment_intent.succeeded": "CHARGE_SUCCESS",
    "payment_intent.processing": isManualCapture
      ? "AUTHORIZATION_REQUEST"
      : "CHARGE_REQUEST",
    "payment_intent.payment_failed": isManualCapture
      ? "AUTHORIZATION_FAILURE"
      : "CHARGE_FAILURE",
    "payment_intent.canceled": "CANCEL_SUCCESS",
    "payment_intent.amount_capturable_updated": "AUTHORIZATION_ADJUSTMENT",
    "payment_intent.requires_action": isManualCapture
      ? "AUTHORIZATION_ACTION_REQUIRED"
      : "CHARGE_ACTION_REQUIRED",
    "charge.refund.updated": getRefundUpdatedEventType(
      notification.refundStatus,
    ),
  };

  const resolvedEventType = eventTypeMapping[notification.type];

  if (!resolvedEventType) {
    return null;
  }

  return {
    type: resolvedEventType,
    availableActions: getAvailableActionsForType(resolvedEventType),
  };
};
