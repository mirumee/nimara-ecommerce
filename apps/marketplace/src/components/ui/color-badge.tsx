import type {
  OrderStatus,
  PaymentChargeStatusEnum,
} from "@/graphql/generated/client";
import { cn } from "@/lib/utils";

/**
 * Union type representing all possible badge statuses.
 * Includes GraphQL enums (PaymentChargeStatusEnum, OrderStatus) and
 * product publication status string literals ("Published", "Draft").
 */
export type BadgeStatusType =
  | PaymentChargeStatusEnum
  | OrderStatus
  | "Published"
  | "Draft";

function formatBadgeLabel(label: BadgeStatusType): string {
  if (label === "Published" || label === "Draft") {
    return label;
  }

  return String(label).replace(/_/g, " ").toLowerCase();
}

export const ColorBadge = ({ label }: { label: BadgeStatusType }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize",
        getBadgeColor(label),
      )}
    >
      {formatBadgeLabel(label)}
    </span>
  );
};

const getBadgeColor = (status: BadgeStatusType) => {
  switch (status) {
    case "NOT_CHARGED":
    case "UNCONFIRMED":
    case "DRAFT":
    case "Draft":
      return "bg-yellow-100 text-yellow-800";
    case "PENDING":
    case "PARTIALLY_CHARGED":
    case "PARTIALLY_REFUNDED":
    case "PARTIALLY_FULFILLED":
      return "bg-blue-100 text-blue-800";
    case "FULLY_CHARGED":
    case "FULLY_REFUNDED":
    case "FULFILLED":
    case "Published":
      return "bg-green-100 text-green-800";
    case "REFUSED":
    case "CANCELLED":
    case "CANCELED":
      return "bg-red-100 text-red-800";
    case "UNFULFILLED":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-red-100 text-red-800";
  }
};
