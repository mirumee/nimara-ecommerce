import { getTranslations } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { getCurrentRegion } from "@/regions/server";
import { userService } from "@/services";

import { OrderLine } from "./_components/order-line";
import { OrderSummary } from "./_components/order-summary";
import { ReturnProductsModal } from "./_components/return-products-modal";

export default async function Page() {
  const accessToken = getAccessToken();
  const [t, region] = await Promise.all([
    getTranslations(),
    getCurrentRegion(),
  ]);
  const languageCode = region.language.code;
  const orders = await userService.ordersGet({
    accessToken,
    languageCode,
  });

  return (
    <div className="flex flex-col gap-6 text-sm">
      <h2 className="text-2xl">{t("account.order-history")}</h2>
      {orders?.length === 0 && (
        <div className="space-y-8">
          <hr />
          <p className="text-stone-500">
            {t("order.sorry-you-dont-have-any-orders")}
          </p>
        </div>
      )}
      {orders?.map((order) => (
        <div className="space-y-8" key={order?.id}>
          <hr />
          <OrderSummary order={order} withStatus />
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-12 sm:items-center">
              {order?.lines.map((line) => {
                const isReturned = order.fulfillments?.some(
                  (fulfillment) =>
                    fulfillment.status === "RETURNED" &&
                    fulfillment.lines?.some(
                      (fulfillmentLine) =>
                        fulfillmentLine.orderLine?.id === line.id,
                    ),
                );

                return (
                  <OrderLine
                    key={line.id}
                    line={line}
                    returnStatus={isReturned ? "RETURNED" : ""}
                  />
                );
              })}
            </div>
          </div>

          {order.status === "FULFILLED" && (
            <ReturnProductsModal
              order={order}
              orderLines={order.lines.map((line) => (
                <OrderLine key={line.id} line={line} />
              ))}
            >
              <OrderSummary order={order} />
            </ReturnProductsModal>
          )}
        </div>
      ))}
    </div>
  );
}
