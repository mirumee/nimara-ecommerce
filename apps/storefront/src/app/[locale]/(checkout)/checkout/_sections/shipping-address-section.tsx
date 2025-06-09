import { getTranslations } from "next-intl/server";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { Button } from "@nimara/ui/components/button";

import { Link } from "@/i18n/routing";
import { displayFormattedAddressLines } from "@/lib/address";
import { paths } from "@/lib/paths";
import { type SupportedLocale } from "@/regions/types";
import { addressService } from "@/services/address";

export async function ShippingAddressSection({
  checkout,
  locale,
}: {
  checkout?: Checkout;
  locale: SupportedLocale;
}) {
  const t = await getTranslations();

  if (!checkout?.shippingAddress) {
    return (
      <section className="flex justify-between pt-8">
        <div>
          <h3 className="scroll-m-20 text-2xl tracking-tight">
            {t("shipping-address.title")}
          </h3>
        </div>
      </section>
    );
  }

  const { shippingAddress } = checkout;

  const result = await addressService.addressFormat({
    variables: { address: shippingAddress },
    locale,
  });

  if (!result.ok) {
    throw new Error("No address form rows.");
  }

  return (
    <section className="flex justify-between pt-4">
      <div className="space-y-2">
        <h3 className="scroll-m-20 text-2xl tracking-tight">
          {t("shipping-address.title")}
        </h3>
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
              query: { country: shippingAddress.country },
            })}
          >
            {t("common.edit")}
          </Link>
        </Button>
      )}
    </section>
  );
}
