export type DateGroupKey =
  | "TODAY"
  | "YESTERDAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "OLDER";

// Reuse the app-wide date-time formatter for consistency
import { formatDateTime as baseFormatDateTime } from "@/lib/utils";

export const formatDateTime = (date: Date) => baseFormatDateTime(date);

export const formatTime = (date: Date) => {
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isToday = (date: Date) => {
  const now = new Date();
  return isSameDay(now, date);
};

const isYesterday = (date: Date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(yesterday, date);
};

const differenceInDays = (a: Date, b: Date) => {
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((start - end) / msPerDay);
};

export const getDateGroupKey = (date: Date): DateGroupKey => {
  const now = new Date();

  if (isToday(date)) {
    return "TODAY";
  }

  if (isYesterday(date)) {
    return "YESTERDAY";
  }

  const daysDiff = differenceInDays(now, date);

  if (daysDiff <= 7) {
    return "LAST_7_DAYS";
  }

  if (daysDiff <= 30) {
    return "LAST_30_DAYS";
  }

  return "OLDER";
};

export const getDateGroupLabel = (
  key: DateGroupKey,
  locale: string = "en-US",
  options: Intl.RelativeTimeFormatOptions = { numeric: "auto", style: "long" },
): string => {
  const rtf = new Intl.RelativeTimeFormat(locale, options);

  switch (key) {
    case "TODAY":
      return rtf.format(0, "day");
    case "YESTERDAY":
      return rtf.format(-1, "day");
    case "LAST_7_DAYS":
      return "Last 7 days";
    case "LAST_30_DAYS":
      return "Last 30 days";
    case "OLDER":
      return "Older";
  }
};

