import { type Locale } from "next-intl";
import { getLocale } from "next-intl/server";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { redirect } from "@nimara/i18n/routing";

import { getCheckoutId } from "@/features/checkout/cart";
import { deleteCheckoutIdCookie } from "@/features/checkout/checkout";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { getCheckoutService } from "@/services/checkout";

export const getCheckoutOrRedirect = async (): Promise<Checkout> | never => {
  const checkoutId = await getCheckoutId();
  const [locale, region] = await Promise.all([getLocale(), getCurrentRegion()]);

  if (!checkoutId) {
    redirect({ href: paths.cart.asPath(), locale });
  }

  const checkoutService = await getCheckoutService();
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
    locale,
  });

  return resultCheckout.data.checkout;
};

/**
 * Validates checkout lines and redirects to the cart page if there are issues.
 */
export const validateCheckoutLinesAction = async ({
  checkout,
  locale,
}: {
  checkout: Checkout;
  locale: Locale;
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
