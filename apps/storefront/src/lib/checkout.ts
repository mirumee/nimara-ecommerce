import { getLocale } from "next-intl/server";

import { type Address } from "@nimara/domain/objects/Address";
import { type Checkout } from "@nimara/domain/objects/Checkout";

import { serverEnvs } from "@/envs/server";
import { redirect } from "@/i18n/routing";
import { getCheckoutId } from "@/lib/actions/cart";
import { deleteCheckoutIdCookie } from "@/lib/actions/checkout";
import { getMarketplaceSessionCheckouts } from "@/lib/marketplace/session-checkout";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { type SupportedLocale } from "@/regions/types";
import { getCheckoutService } from "@/services/checkout";

export type CheckoutCollection = {
  checkout: Checkout;
  checkoutIds: string[];
  checkouts: Checkout[];
  hasMixedCurrencies: boolean;
};

export const getCheckoutCollectionOrRedirect = async ():
  | Promise<CheckoutCollection>
  | never => {
  const checkoutId = await getCheckoutId();
  const [locale, region] = await Promise.all([getLocale(), getCurrentRegion()]);

  if (!checkoutId && !serverEnvs.MARKETPLACE_MODE) {
    redirect({ href: paths.cart.asPath(), locale });
  }

  const checkoutService = await getCheckoutService();

  if (serverEnvs.MARKETPLACE_MODE) {
    const marketplaceCheckouts = await getMarketplaceSessionCheckouts({
      checkoutService,
      region,
    });

    if (!marketplaceCheckouts) {
      await deleteCheckoutIdCookie();
      redirect({ href: paths.cart.asPath(), locale });
    }

    await validateCheckoutLinesAction({
      checkout: marketplaceCheckouts.checkout,
      locale: locale as SupportedLocale,
    });

    return marketplaceCheckouts;
  }

  const resultCheckout = await checkoutService.checkoutGet({
    checkoutId: checkoutId!,
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

  return {
    checkout: resultCheckout.data.checkout,
    checkoutIds: [resultCheckout.data.checkout.id],
    checkouts: [resultCheckout.data.checkout],
    hasMixedCurrencies: false,
  };
};

export const getCheckoutOrRedirect = async (): Promise<Checkout> | never => {
  const { checkout } = await getCheckoutCollectionOrRedirect();

  return checkout;
};

export type FormattedAddress = {
  formattedAddress: string[];
} & {
  address: Address;
};

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
