import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { ProductImagePlaceholder } from "@/components/product-image-placeholder";
import { getLocalizedFormatter } from "@/lib/formatters/get-localized-formatter";
import { getCurrentRegion } from "@/regions/server";
import { userService } from "@/services";

export default async function Page() {
  const accessToken = getAccessToken();
  const [t, region, formatter] = await Promise.all([
    getTranslations(),
    getCurrentRegion(),
    getLocalizedFormatter(),
  ]);
  const languageCode = region.language.code;
  const orders = await userService.ordersGet({
    accessToken,
    languageCode,
  });

  return (
    <div className="flex flex-col gap-8 text-sm">
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
        <div className="space-y-8 pb-4" key={order?.id}>
          <hr />
          <div className="grid grid-cols-4 gap-y-4 sm:grid-cols-6 sm:gap-y-0">
            <div className="col-span-2">
              <p className="text-stone-500">{t("order.order-number")}</p>
              <p>{order?.number}</p>
            </div>
            <div className="col-span-2">
              <p className="text-stone-500">{t("order.total")}</p>
              <p>
                {formatter.price({
                  amount: order?.total?.amount,
                  currency: order?.total?.currency,
                })}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-stone-500">{t("order.date-ordered")}</p>
              <p>
                {formatter.date({
                  date: order?.created,
                  options: {
                    weekday: "short",
                    month: "2-digit",
                    year: "numeric",
                    day: "2-digit",
                  },
                })}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {order?.lines.map((line) => {
              const isFree = line?.totalPrice?.amount === 0;

              return (
                <div
                  key={line?.id}
                  className="grid grid-cols-4 gap-2 sm:grid-cols-12 sm:items-center"
                >
                  {line?.thumbnail?.url ? (
                    <Image
                      alt={line?.thumbnail?.alt ?? ""}
                      src={line?.thumbnail.url}
                      sizes="56px"
                      width={0}
                      height={0}
                      className="col-span-1 h-[56px] w-[42px] rounded border object-cover"
                    />
                  ) : (
                    <ProductImagePlaceholder height={56} width={42} />
                  )}
                  <div className="col-span-3 block sm:hidden">
                    <p>{[line?.productName, line?.variantName].join(" • ")}</p>
                    <span className="flex gap-2">
                      <p className="w-1/2 text-stone-500">
                        {t("common.qty")}: {line?.quantity}
                      </p>
                      <p className="w-1/2 text-end text-stone-500">
                        {isFree
                          ? t("common.free")
                          : formatter.price({
                              amount: line?.totalPrice?.amount,
                              currency: line?.totalPrice?.currency,
                            })}
                      </p>
                    </span>
                  </div>
                  <p className="col-span-7 hidden sm:block">
                    {[line?.productName, line?.variantName].join(" • ")}
                  </p>
                  <p className="col-span-2 hidden text-end text-stone-500 sm:block">
                    {t("common.qty")}: {line?.quantity}
                  </p>
                  <p className="col-span-2 hidden text-end text-stone-500 sm:block">
                    {isFree
                      ? t("common.free")
                      : formatter.price({
                          amount: line?.totalPrice?.amount,
                          currency: line?.totalPrice?.currency,
                        })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
