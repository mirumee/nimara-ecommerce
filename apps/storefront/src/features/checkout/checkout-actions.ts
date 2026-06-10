import { type Locale } from "next-intl";
import { getLocale } from "next-intl/server";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { redirect } from "@nimara/i18n/routing";
import { type FetchOptions } from "@nimara/infrastructure/graphql/client";

import {
  MARKETPLACE_DEFAULT_VENDOR_DISPLAY_NAME,
  MARKETPLACE_NO_VENDOR_BUCKET,
} from "@/config";
import { aggregateMarketplaceCheckouts } from "@/features/checkout/aggregations";
import {
  deleteCheckoutIdCookie,
  getAllCheckoutIds,
  getCheckoutId,
} from "@/features/checkout/server";
import { type MarketplaceCheckoutItem } from "@/features/checkout/types";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

/**
 * Retrieves the current checkout for the user or redirects to the cart page if not found or invalid.
 *
 * @returns {Promise<Checkout>} The current valid checkout object.
 * @throws Redirects to the cart page on error or missing/invalid checkout.
 */
export const getCheckoutOrRedirect = async (
  options?: FetchOptions,
): Promise<Checkout> | never => {
  const checkoutId = await getCheckoutId();
  const [locale, region] = await Promise.all([getLocale(), getCurrentRegion()]);

  if (!checkoutId) {
    redirect({ href: paths.cart.asPath(), locale });
  }

  const services = await getServiceRegistry();
  const checkoutService = await services.getCheckoutService();
  const resultCheckout = await checkoutService.checkoutGet({
    checkoutId,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
    options,
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

export const getMarketplaceCheckoutsOrRedirect = async ():
  | Promise<MarketplaceCheckoutItem[]>
  | never => {
  const [checkoutIdsByVendor, locale, region, services] = await Promise.all([
    getAllCheckoutIds(),
    getLocale(),
    getCurrentRegion(),
    getServiceRegistry(),
  ]);

  const checkoutIds = [...new Set(Object.values(checkoutIdsByVendor))];

  if (!checkoutIds.length) {
    redirect({ href: paths.cart.asPath(), locale });
  }

  const checkoutService = await services.getCheckoutService();
  const checkoutIdToVendorKey = new Map<string, string>(
    Object.entries(checkoutIdsByVendor).map(([vendorKey, checkoutId]) => [
      checkoutId,
      vendorKey,
    ]),
  );
  const resultCheckouts = await Promise.all(
    checkoutIds.map(async (checkoutId) => {
      const result = await checkoutService.checkoutGet({
        checkoutId,
        languageCode: region.language.code,
        countryCode: region.market.countryCode,
      });

      if (!result.ok) {
        return null;
      }

      const vendorKey =
        checkoutIdToVendorKey.get(checkoutId) ?? MARKETPLACE_NO_VENDOR_BUCKET;
      const checkout = result.data.checkout;

      let displayName = MARKETPLACE_DEFAULT_VENDOR_DISPLAY_NAME;

      if (vendorKey !== MARKETPLACE_NO_VENDOR_BUCKET) {
        const marketplaceService = await services.getMarketplaceService();
        const vendorProfileResult =
          await marketplaceService.vendorGetByID(vendorKey);

        if (vendorProfileResult.ok && vendorProfileResult.data) {
          displayName = vendorProfileResult.data.name;
        }
      }

      await validateCheckoutLinesAction({ checkout, locale });

      return {
        checkout,
        checkoutId,
        vendorKey,
        vendorDisplayName: displayName,
      } satisfies MarketplaceCheckoutItem;
    }),
  );

  const validCheckoutItems = resultCheckouts.filter(
    (entry): entry is MarketplaceCheckoutItem =>
      entry !== null && entry.checkout.lines.length > 0,
  );

  if (!validCheckoutItems.length) {
    await deleteCheckoutIdCookie();
    redirect({ href: paths.cart.asPath(), locale });
  }

  return validCheckoutItems;
};

export const getMarketplaceCheckoutSummary = (
  checkoutItems: MarketplaceCheckoutItem[],
): Checkout => aggregateMarketplaceCheckouts(checkoutItems);

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
