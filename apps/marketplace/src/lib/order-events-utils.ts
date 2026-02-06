import type {
  OrderDetail_order_Order_events_OrderEvent as OrderEvent,
  OrderEventsEmailsEnum,
  OrderEventsEnum,
} from "@/graphql/generated/client";
import { type DateGroupKey, getDateGroupKey } from "@/lib/time";
import { formatPrice as _formatPrice } from "@/lib/utils";

export const getUserDisplayName = (user: OrderEvent["user"]): string | null => {
  if (!user) {
    return null;
  }

  return user.email;
};

export const EMAIL_TYPE_LABELS: Partial<Record<OrderEventsEmailsEnum, string>> =
  {
    ORDER_CONFIRMATION: "Order confirmation",
    FULFILLMENT_CONFIRMATION: "Fulfillment confirmation",
    SHIPPING_CONFIRMATION: "Shipping confirmation",
    TRACKING_UPDATED: "Tracking update",
    ORDER_CANCEL: "Order cancellation",
    ORDER_REFUND: "Refund confirmation",
    PAYMENT_CONFIRMATION: "Payment confirmation",
    CONFIRMED: "Confirmation",
    DIGITAL_LINKS: "Digital links",
  };

const getEmailTypeLabel = (emailType: OrderEventsEmailsEnum | null): string => {
  if (!emailType) {
    return "Email";
  }

  return EMAIL_TYPE_LABELS[emailType] ?? "Email";
};

export const ORDER_EVENT_MESSAGES: Partial<Record<OrderEventsEnum, string>> = {
  PLACED: "Order was placed",
  PLACED_AUTOMATICALLY_FROM_PAID_CHECKOUT:
    "Order was placed automatically from paid checkout",
  PLACED_FROM_DRAFT: "Order was placed from draft",
  CONFIRMED: "Order was confirmed",
  CANCELED: "Order was cancelled",
  ORDER_FULLY_PAID: "Order was fully paid",
  ORDER_MARKED_AS_PAID: "Order was marked as paid",
  PAYMENT_AUTHORIZED: "Payment was authorized",
  PAYMENT_CAPTURED: "Payment was captured",
  PAYMENT_REFUNDED: "Payment was refunded",
  PAYMENT_VOIDED: "Payment was voided",
  PAYMENT_FAILED: "Payment failed",
  FULFILLMENT_FULFILLED_ITEMS: "Items were fulfilled",
  FULFILLMENT_CANCELED: "Fulfillment was cancelled",
  FULFILLMENT_RESTOCKED_ITEMS: "Items were restocked",
  FULFILLMENT_REFUNDED: "Fulfillment was refunded",
  FULFILLMENT_RETURNED: "Items were returned",
  FULFILLMENT_REPLACED: "Items were replaced",
  FULFILLMENT_AWAITS_APPROVAL: "Fulfillment awaits approval",
  TRACKING_UPDATED: "Tracking information was updated",
  DRAFT_CREATED: "Draft order was created",
  DRAFT_CREATED_FROM_REPLACE: "Draft order was created from replacement",
  ADDED_PRODUCTS: "Products were added",
  REMOVED_PRODUCTS: "Products were removed",
  UPDATED_ADDRESS: "Address was updated",
  INVOICE_REQUESTED: "Invoice was requested",
  INVOICE_GENERATED: "Invoice was generated",
  INVOICE_SENT: "Invoice was sent",
  INVOICE_UPDATED: "Invoice was updated",
  ORDER_DISCOUNT_ADDED: "Discount was added",
  ORDER_DISCOUNT_UPDATED: "Discount was updated",
  ORDER_DISCOUNT_DELETED: "Discount was removed",
  ORDER_DISCOUNT_AUTOMATICALLY_UPDATED: "Discount was automatically updated",
  ORDER_LINE_DISCOUNT_UPDATED: "Line discount was updated",
  ORDER_LINE_DISCOUNT_REMOVED: "Line discount was removed",
  ORDER_LINE_PRODUCT_DELETED: "Product was deleted from order",
  ORDER_LINE_VARIANT_DELETED: "Variant was deleted from order",
  ORDER_REPLACEMENT_CREATED: "Replacement order was created",
  EXTERNAL_SERVICE_NOTIFICATION: "External service notification",
  TRANSACTION_EVENT: "Transaction event occurred",
  TRANSACTION_CHARGE_REQUESTED: "Charge was requested",
  TRANSACTION_REFUND_REQUESTED: "Refund was requested",
  TRANSACTION_CANCEL_REQUESTED: "Cancellation was requested",
  TRANSACTION_MARK_AS_PAID_FAILED: "Failed to mark transaction as paid",
  EXPIRED: "Order expired",
  OVERSOLD_ITEMS: "Some items were oversold",
  OTHER: "Event occurred",
};

export const getOrderEventMessage = (
  event: OrderEvent,
  _currency?: string,
): string | null => {
  const type = (event.type ?? null) as OrderEventsEnum | null;
  const message = event.message ?? null;
  const email = (event as unknown as { email?: string | null }).email ?? null;
  const emailType =
    (event as unknown as { emailType?: OrderEventsEmailsEnum | null }).emailType ?? null;

  if (!type) {
    return message ?? null;
  }

  switch (type) {
    case "PAYMENT_CAPTURED":
    case "PAYMENT_REFUNDED": {
      // We don't currently have an amount field in this schema,
      // so fall back to the generic message used in the original code
      return ORDER_EVENT_MESSAGES[type] ?? null;
    }

    case "EMAIL_SENT": {
      const emailLabel = getEmailTypeLabel(emailType ?? null);

      return email
        ? `${emailLabel} has been sent to ${email}`
        : `${emailLabel} was sent`;
    }

    case "NOTE_ADDED":
    case "NOTE_UPDATED":
      return null;

    default:
      return ORDER_EVENT_MESSAGES[type] ?? message ?? "Event occurred";
  }
};

const DATE_GROUP_ORDER: DateGroupKey[] = [
  "TODAY",
  "YESTERDAY",
  "LAST_7_DAYS",
  "LAST_30_DAYS",
  "OLDER",
];

export const groupEventsByDate = (
  events: OrderEvent[],
): [DateGroupKey, OrderEvent[]][] => {
  const timelineEvents = events.filter(
    (event) => event.type !== "NOTE_ADDED" && event.type !== "NOTE_UPDATED",
  );

  const sortedEvents = [...timelineEvents]
    .filter((event) => event.date)
    .sort(
      (a, b) =>
        new Date(b.date as string).getTime() -
        new Date(a.date as string).getTime(),
    );

  const groups = sortedEvents.reduce((acc, event) => {
    const groupKey = getDateGroupKey(new Date(event.date as string));
    const group = acc.get(groupKey) ?? [];

    group.push(event);
    acc.set(groupKey, group);

    return acc;
  }, new Map<DateGroupKey, OrderEvent[]>());

  return DATE_GROUP_ORDER.filter((key) => groups.has(key)).map((key) => [
    key,
    groups.get(key)!,
  ]);
};

export const getOrderNotes = (events: OrderEvent[]): OrderEvent[] => {
  return events.filter((event) => event.type === "NOTE_ADDED").reverse();
};
