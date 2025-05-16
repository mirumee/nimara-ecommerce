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

  const { shippingAddress } = checkout;

  const result = await addressService.addressFormat({
    variables: { address: shippingAddress },
  });

  if (!result.ok) {
    throw new Error("No address form rows.");
  }

  return (
    <section className="flex justify-between pt-4">
      <div className="space-y-2">
        <h3 className="scroll-m-20 text-2xl tracking-tight">{t("title")}</h3>
        <div className="text-sm leading-5 text-stone-900">
          {displayFormattedAddressLines({
            addressId: shippingAddress.id,
            formattedAddress: result.data.formattedAddress,
          })}
        </div>
      </div>
      {shippingAddress && (
        <Button variant="outline" asChild>
          <Link
            href={paths.checkout.shippingAddress.asPath({
              query: { country: shippingAddress.country.code },
            })}
          >
            {tc("edit")}
          </Link>
        </Button>
      )}
    </section>
  );
}
