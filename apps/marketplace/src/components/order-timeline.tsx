import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@nimara/ui/components/card";

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

interface OrderTimelineProps {
  currency?: string;
  events: OrderEvent[];
}

interface TimelineEventProps {
  currency?: string;
  event: OrderEvent;
  showFullDate?: boolean;
}

const TimelineEvent = ({
  event,
  currency,
  showFullDate,
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
        <div className="bg-muted-foreground/50 mt-2 h-2 w-2 shrink-0 rounded-full" />
        <div className="bg-border min-h-6 w-px flex-1" />
      </div>

      {/* Event content */}
      <div className="flex-1">
        <p className="text-sm leading-relaxed">
          {message}
          {userName && (
            <span className="text-muted-foreground"> by {userName}</span>
          )}
        </p>
        {date && (
          <p className="text-muted-foreground mt-0.5 text-xs">
            {showFullDate ? formatDateTime(date) : formatTime(date)}
          </p>
        )}
      </div>
    </div>
  );
};

interface DateGroupProps {
  currency?: string;
  events: OrderEvent[];
  groupKey: DateGroupKey;
  showHeader: boolean;
}

const DateGroup = ({
  groupKey,
  events,
  currency,
  showHeader,
}: DateGroupProps) => {
  const isOlderGroup =
    groupKey === "LAST_7_DAYS" ||
    groupKey === "LAST_30_DAYS" ||
    groupKey === "OLDER";
  const needsDateContext = !showHeader && groupKey !== "TODAY";
  const showFullDate = isOlderGroup || needsDateContext;

  const visibleEvents = useMemo(
    () =>
      events.filter(
        (event) => getOrderEventMessage(event, currency) !== null,
      ),
    [events, currency],
  );

  return (
    <div>
      {showHeader && (
        <div className="text-muted-foreground mb-3 text-xs font-medium capitalize">
          {getDateGroupLabel(groupKey)}
        </div>
      )}
      <div>
        {visibleEvents.map((event) => (
          <TimelineEvent
            key={event.id}
            event={event}
            currency={currency}
            showFullDate={showFullDate}
          />
        ))}
      </div>
    </div>
  );
};

export function OrderTimeline({ events, currency }: OrderTimelineProps) {
  const groupedEvents = useMemo(
    () => groupEventsByDate(events),
    [events],
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
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 max-h-64 overflow-y-auto">
          {visibleGroups.map(([groupKey, groupEvents]) => (
            <DateGroup
              key={groupKey}
              groupKey={groupKey}
              events={groupEvents}
              currency={currency}
              showHeader={showHeaders}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
