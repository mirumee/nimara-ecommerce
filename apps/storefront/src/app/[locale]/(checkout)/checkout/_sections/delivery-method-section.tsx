import { getTranslations } from "next-intl/server";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { Button } from "@nimara/ui/components/button";

import { Link } from "@/i18n/routing";
import { paths } from "@/lib/paths";

export const DeliveryMethodSection = async ({
  checkout,
}: {
  checkout: Checkout;
}) => {
  const t = await getTranslations("delivery-method");
  const tc = await getTranslations("common");

  return (
    <section className="flex justify-between pt-8">
      <div className="space-y-2">
        <h3 className="scroll-m-20 text-2xl tracking-tight">{t("title")}</h3>
        <p className="text-sm font-normal leading-5 text-stone-900">
          {checkout.deliveryMethod?.name}
        </p>
      </div>
      {checkout.deliveryMethod && (
        <Button variant="outline" asChild>
          <Link href={paths.checkout.deliveryMethod.asPath()}>
            {tc("edit")}
          </Link>
        </Button>
      )}
    </section>
  );
};
