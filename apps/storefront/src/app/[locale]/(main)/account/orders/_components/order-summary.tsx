import { getTranslations } from "next-intl/server";

import type { Order } from "@nimara/domain/objects/Order";
import { cn } from "@nimara/foundation/lib/cn";

import { getLocalizedFormatter } from "@/foundation/formatters/get-localized-formatter";

export const OrderSummary = async ({
  order,
  withStatus,
}: {
  order: Order;
  withStatus?: boolean;
}) => {
  const [t, formatter] = await Promise.all([
    getTranslations(),
    getLocalizedFormatter(),
  ]);

  return (
    <div
      className={cn("grid grid-cols-4 gap-y-4 sm:gap-y-0", {
        "sm:grid-cols-8": withStatus,
        "sm:grid-cols-6": !withStatus,
      })}
    >
      <div className="col-span-2">
        <p className="text-stone-500 dark:text-muted-foreground">
          {t("order.order-number")}
        </p>
        <p className="text-primary">{order.number}</p>
      </div>
      <div className="col-span-2">
        <p className="text-stone-500 dark:text-muted-foreground">
          {t("order.total")}
        </p>
        <p className="text-primary">
          {formatter.price({
            amount: order.total.amount,
          })}
        </p>
      </div>
      <div className="col-span-2">
        <p className="text-stone-500 dark:text-muted-foreground">
          {t("order.date-ordered")}
        </p>
        <p className="text-primary">
          {formatter.date({
            date: order.created,
            options: {
              weekday: "short",
              month: "2-digit",
              year: "numeric",
              day: "2-digit",
            },
          })}
        </p>
      </div>
      {withStatus && (
        <div className="col-span-2">
          <p className="text-stone-500 dark:text-muted-foreground">
            {t("order.order-status")}
          </p>
          <p className="text-primary">{order.status}</p>
        </div>
      )}
    </div>
  );
};
