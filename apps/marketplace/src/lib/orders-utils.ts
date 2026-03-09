import type {
  OrderFilterInput,
  OrderStatusFilter,
  PaymentChargeStatusEnum,
} from "@/graphql/generated/client";

const formatToDateString = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};

const startOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
const subDays = (d: Date, days: number): Date => {
  const out = new Date(d);

  out.setDate(out.getDate() - days);

  return out;
};
const subMonths = (d: Date, months: number): Date => {
  const out = new Date(d);

  out.setMonth(out.getMonth() - months);

  return out;
};

export const PRESET_DATE_RANGES: {
  gte: string;
  label: string;
  lte: string;
}[] = [
  {
    label: "Today",
    gte: formatToDateString(startOfDay(new Date())),
    lte: formatToDateString(endOfDay(new Date())),
  },
  {
    label: "Yesterday",
    gte: formatToDateString(startOfDay(subDays(new Date(), 1))),
    lte: formatToDateString(endOfDay(subDays(new Date(), 1))),
  },
  {
    label: "Last 7 days",
    gte: formatToDateString(startOfDay(subDays(new Date(), 7))),
    lte: formatToDateString(endOfDay(new Date())),
  },
  {
    label: "Last month",
    gte: formatToDateString(startOfDay(subMonths(new Date(), 1))),
    lte: formatToDateString(endOfDay(new Date())),
  },
];

export type OrdersFilter = OrderFilterInput | undefined;

export function getActiveFiltersCount(filter: OrdersFilter): {
  date: number;
  fulfillmentStatus: number;
  paymentStatus: number;
  total: number;
} {
  let dateCount = 0;
  let paymentStatusCount = 0;
  let fulfillmentStatusCount = 0;

  if (filter?.created?.gte) {
    dateCount++;
  }
  if (filter?.created?.lte) {
    dateCount++;
  }
  if (filter?.paymentStatus?.length) {
    paymentStatusCount = filter.paymentStatus.length;
  }
  if (filter?.status?.length) {
    fulfillmentStatusCount = filter.status.length;
  }

  return {
    total: dateCount + paymentStatusCount + fulfillmentStatusCount,
    date: dateCount,
    paymentStatus: paymentStatusCount,
    fulfillmentStatus: fulfillmentStatusCount,
  };
}

export function toggleValueInArray<T>(
  arr: T[],
  value: T,
  checked: boolean | "indeterminate",
): T[] {
  const isChecked = checked === true;

  if (isChecked) {
    return arr.includes(value) ? arr : [...arr, value];
  }

  return arr.filter((x) => x !== value);
}

export const PAYMENT_STATUS_OPTIONS: PaymentChargeStatusEnum[] = [
  "NOT_CHARGED",
  "PENDING",
  "FULLY_CHARGED",
  "PARTIALLY_REFUNDED",
  "FULLY_REFUNDED",
];

export const FULFILLMENT_STATUS_OPTIONS: OrderStatusFilter[] = [
  "UNFULFILLED",
  "PARTIALLY_FULFILLED",
  "FULFILLED",
  "CANCELED",
];
