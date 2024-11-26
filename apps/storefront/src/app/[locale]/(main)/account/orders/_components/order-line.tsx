import Image from "next/image";
import { getTranslations } from "next-intl/server";

import type { OrderLine as OrderLineType } from "@nimara/domain/objects/Order";

import { ProductImagePlaceholder } from "@/components/product-image-placeholder";
import { getLocalizedFormatter } from "@/lib/formatters/get-localized-formatter";

export const OrderLine = async ({
  line,
  returnStatus,
}: {
  line: OrderLineType;
  returnStatus?: string;
}) => {
  const [t, formatter] = await Promise.all([
    getTranslations(),
    getLocalizedFormatter(),
  ]);

  const isFree = line?.totalPrice?.amount === 0;

  return (
    <>
      {line?.thumbnail?.url ? (
        <Image
          alt={line?.thumbnail?.alt ?? ""}
          src={line?.thumbnail.url}
          sizes="56px"
          width={42}
          height={56}
          className="col-span-1 h-[56px] w-[42px] rounded border object-cover"
        />
      ) : (
        <ProductImagePlaceholder height={56} width={42} />
      )}
      <div className="col-span-3 block sm:hidden">
        <p>{[line?.productName, line?.variantName].join(" • ")}</p>
        <span className="flex gap-2">
          <p className="w-1/3 text-stone-500">
            {t("common.qty")}: {line?.quantity}
          </p>
          <p className="w-1/3 text-center font-bold text-black">
            {returnStatus || ""}
          </p>
          <p className="w-1/3 text-end text-stone-500">
            {isFree
              ? t("common.free")
              : formatter.price({
                  amount: line?.totalPrice?.amount,
                  currency: line?.totalPrice?.currency,
                })}
          </p>
        </span>
      </div>
      <p className="col-span-5 hidden sm:block">
        {[line?.productName, line?.variantName].join(" • ")}
      </p>
      <p className="col-span-2 hidden text-center text-sm font-bold text-black sm:block">
        {returnStatus || ""}
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
    </>
  );
};
