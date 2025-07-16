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

  const isFree = line.totalPrice?.amount === 0;
  const priceLabel = isFree
    ? t("common.free")
    : formatter.price({
        amount: line.totalPrice.amount,
      });
  const lineName = [line?.productName, line?.variantName].join(" • ");
  const quantityLabel = `${t("common.qty")}: ${line.quantity}`;

  return (
    <>
      {line.thumbnail?.url ? (
        <Image
          alt={line.thumbnail.alt ?? ""}
          src={line.thumbnail.url}
          sizes="56px"
          width={42}
          height={56}
          className="col-span-1 h-[56px] w-[42px] rounded border object-cover"
        />
      ) : (
        <ProductImagePlaceholder height={56} width={42} />
      )}
      <div className="col-span-3 block sm:hidden">
        <p className="text-primary">{lineName}</p>
        <span className="flex gap-2">
          <p className="w-1/3 text-stone-500 dark:text-stone-400">
            {quantityLabel}
          </p>
          <p className="text-primary w-1/3 text-center font-bold">
            {returnStatus || ""}
          </p>
          <p className="w-1/3 text-end text-stone-500 dark:text-stone-400">
            {priceLabel}
          </p>
        </span>
      </div>
      <p className="text-primary col-span-5 hidden sm:block">{lineName}</p>
      <p className="text-primary col-span-2 hidden text-center text-sm font-bold sm:block">
        {returnStatus || ""}
      </p>
      <p className="dark:text-muted-foreground col-span-2 hidden text-end text-stone-500 sm:block">
        {quantityLabel}
      </p>
      <p className="dark:text-muted-foreground col-span-2 hidden text-end text-stone-500 sm:block">
        {priceLabel}
      </p>
    </>
  );
};
