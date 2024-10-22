import { getTranslations } from "next-intl/server";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { Button } from "@nimara/ui/components/button";

import { Link } from "@/i18n/routing";
import { displayFormattedAddressLines } from "@/lib/address";
import { paths } from "@/lib/paths";
import { addressService } from "@/services";

export async function ShippingAddressSection({
  checkout,
}: {
  checkout?: Checkout;
}) {
  const [t, tc] = await Promise.all([
    getTranslations("shipping-address"),
    getTranslations("common"),
  ]);

  if (!checkout?.shippingAddress) {
    return (
      <section className="flex justify-between pt-4">
        <div>
          <h3 className="scroll-m-20 text-2xl tracking-tight">{t("title")}</h3>
        </div>
      </section>
    );
  }

  const { formattedAddress } = await addressService.addressFormat({
    variables: { address: checkout.shippingAddress },
  });

  if (!formattedAddress) {
    throw new Error("No address form rows.");
  }

  return (
    <section className="flex justify-between pt-4">
      <div className="space-y-2">
        <h3 className="scroll-m-20 text-2xl tracking-tight">{t("title")}</h3>
        <div className="text-sm leading-5 text-stone-900">
          {displayFormattedAddressLines({
            addressId: checkout?.shippingAddress.id,
            formattedAddress,
          })}
        </div>
      </div>
      {checkout.shippingAddress && (
        <Link href={paths.checkout.shippingAddress.asPath()}>
          <Button variant="outline">{tc("edit")}</Button>
        </Link>
      )}
    </section>
  );
}
