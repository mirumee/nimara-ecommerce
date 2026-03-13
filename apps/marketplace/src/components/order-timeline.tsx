import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

import type { OrderDetail_order_Order_events_OrderEvent as OrderEvent } from "@/graphql/generated/client";

import {
  getOrderEventMessage,
  getUserDisplayName,
  groupEventsByDate,
} from "../lib/order-events-utils";
import {
  type DateGroupKey,
  formatDateTime,
  formatTime,
  getDateGroupLabel,
} from "../lib/time";

const DATE_GROUP_KEYS: Record<
  "LAST_7_DAYS" | "LAST_30_DAYS" | "OLDER",
  string
> = {
  LAST_7_DAYS: "common.date-group-last-7-days",
  LAST_30_DAYS: "common.date-group-last-30-days",
  OLDER: "common.date-group-older",
};

interface OrderTimelineProps {
  currency?: string;
  events: OrderEvent[];
}

interface TimelineEventProps {
  byPrefix: string;
  currency?: string;
  event: OrderEvent;
  showFullDate?: boolean;
}

const TimelineEvent = ({
  event,
  currency,
  showFullDate,
  byPrefix,
}: TimelineEventProps) => {
  const message = getOrderEventMessage(event, currency);
  const date = event.date ? new Date(event.date) : null;
  const userName = getUserDisplayName(event.user);

  if (!message) {
    return null;
  }

  return (
    <div className="ml-1 flex items-start gap-3 pb-4 last:pb-0 [&:last-child>div:first-child>div:last-child]:hidden">
      {/* Timeline dot and line */}
      <div className="flex flex-col items-center">
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/50" />
        <div className="min-h-6 w-px flex-1 bg-border" />
      </div>

      {/* Event content */}
      <div className="flex-1">
        <p className="text-sm leading-relaxed">
          {message}
          {userName && (
            <span className="text-muted-foreground">
              {byPrefix}
              {userName}
            </span>
          )}
        </p>
        {date && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {showFullDate ? formatDateTime(date) : formatTime(date)}
          </p>
        )}
      </div>
    </div>
  );
};

interface DateGroupProps {
  byPrefix: string;
  currency?: string;
  events: OrderEvent[];
  getDateGroupLabelResolved: (key: DateGroupKey) => string;
  groupKey: DateGroupKey;
  showHeader: boolean;
}

const DateGroup = ({
  groupKey,
  events,
  currency,
  showHeader,
  getDateGroupLabelResolved,
  byPrefix,
}: DateGroupProps) => {
  const isOlderGroup =
    groupKey === "LAST_7_DAYS" ||
    groupKey === "LAST_30_DAYS" ||
    groupKey === "OLDER";
  const needsDateContext = !showHeader && groupKey !== "TODAY";
  const showFullDate = isOlderGroup || needsDateContext;

  const visibleEvents = useMemo(
    () =>
      events.filter((event) => getOrderEventMessage(event, currency) !== null),
    [events, currency],
  );

  return (
    <div>
      {showHeader && (
        <div className="mb-3 text-xs font-medium capitalize text-muted-foreground">
          {getDateGroupLabelResolved(groupKey)}
        </div>
      )}
      <div>
        {visibleEvents.map((event) => (
          <TimelineEvent
            key={event.id}
            event={event}
            currency={currency}
            showFullDate={showFullDate}
            byPrefix={byPrefix}
          />
        ))}
      </div>
    </div>
  );
};

export function OrderTimeline({ events, currency }: OrderTimelineProps) {
  const t = useTranslations();
  const byPrefix = t("common.event-by-prefix");
  const groupedEvents = useMemo(() => groupEventsByDate(events), [events]);

  const getDateGroupLabelResolved = useCallback(
    (key: DateGroupKey): string => {
      if (key === "LAST_7_DAYS" || key === "LAST_30_DAYS" || key === "OLDER") {
        return t(DATE_GROUP_KEYS[key]);
      }

      return getDateGroupLabel(key);
    },
    [t],
  );

  const visibleGroups = useMemo(
    () =>
      groupedEvents.filter(([, groupEvents]) => {
        return groupEvents.some(
          (event) => getOrderEventMessage(event, currency) !== null,
        );
      }),
    [groupedEvents, currency],
  );

  const showHeaders =
    visibleGroups.length > 1 ||
    (visibleGroups.length === 1 && visibleGroups[0][0] !== "TODAY");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("marketplace.orders.detail.timeline")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-64 space-y-6 overflow-y-auto">
          {visibleGroups.map(([groupKey, groupEvents]) => (
            <DateGroup
              key={groupKey}
              groupKey={groupKey}
              events={groupEvents}
              currency={currency}
              showHeader={showHeaders}
              getDateGroupLabelResolved={getDateGroupLabelResolved}
              byPrefix={byPrefix}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
