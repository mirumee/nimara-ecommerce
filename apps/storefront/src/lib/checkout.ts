import { getLocale } from "next-intl/server";

import { type Address } from "@nimara/domain/objects/Address";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type OkResult } from "@nimara/domain/objects/Result";

import { redirect } from "@/i18n/routing";
import { getCheckoutId } from "@/lib/actions/cart";
import { deleteCheckoutIdCookie } from "@/lib/actions/checkout";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { type SupportedLocale } from "@/regions/types";
import { type addressService } from "@/services/address";
import { checkoutService } from "@/services/checkout";

export const getCheckoutOrRedirect = async (): Promise<Checkout> | never => {
  const checkoutId = await getCheckoutId();
  const [locale, region] = await Promise.all([getLocale(), getCurrentRegion()]);

  if (!checkoutId) {
    redirect({ href: paths.cart.asPath(), locale });
  }

  const resultCheckout = await checkoutService.checkoutGet({
    checkoutId,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
  });

  if (!resultCheckout.ok) {
    await deleteCheckoutIdCookie();
    redirect({ href: paths.cart.asPath(), locale });
  }

  await validateCheckoutLinesAction({
    checkout: resultCheckout.data.checkout,
    locale: locale as SupportedLocale,
  });

  return resultCheckout.data.checkout;
};

export type FormattedAddress = OkResult<
  Awaited<ReturnType<typeof addressService.addressFormat>>
> & { address: Address };

/**
 * Validates checkout lines and redirects to the cart page if there are issues.
 */
export const validateCheckoutLinesAction = async ({
  checkout,
  locale,
}: {
  checkout: Checkout;
  locale: SupportedLocale;
}) => {
  let redirectReason: string | undefined;

  if (checkout.problems.insufficientStock.length) {
    redirectReason = "INSUFFICIENT_STOCK";
  }

  if (checkout.problems.variantNotAvailable.length) {
    redirectReason = "VARIANT_NOT_AVAILABLE";
  }

  if (redirectReason) {
    redirect({
      href: paths.cart.asPath({ query: { redirectReason } }),
      locale,
    });
  }
};
