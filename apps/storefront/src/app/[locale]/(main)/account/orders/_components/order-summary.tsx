import { getTranslations } from "next-intl/server";

import type { Order } from "@nimara/domain/objects/Order";

import { getLocalizedFormatter } from "@/lib/formatters/get-localized-formatter";
import { cn } from "@/lib/utils";

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
        <p className="dark:text-muted-foreground text-stone-500">
          {t("order.order-number")}
        </p>
        <p className="text-primary">{order.number}</p>
      </div>
      <div className="col-span-2">
        <p className="dark:text-muted-foreground text-stone-500">
          {t("order.total")}
        </p>
        <p className="text-primary">
          {formatter.price({
            amount: order.total.amount,
          })}
        </p>
      </div>
      <div className="col-span-2">
        <p className="dark:text-muted-foreground text-stone-500">
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
          <p className="dark:text-muted-foreground text-stone-500">
            {t("order.order-status")}
          </p>
          <p className="text-primary">{order.status}</p>
        </div>
      )}
    </div>
  );
};
