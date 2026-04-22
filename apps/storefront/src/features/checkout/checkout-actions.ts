import { type Locale } from "next-intl";
import { getLocale } from "next-intl/server";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { redirect } from "@nimara/i18n/routing";

import { aggregateMarketplaceCheckouts } from "@/features/checkout/aggregations";
import {
  clearCheckoutCookie,
  getCheckoutId,
  getCheckoutIdsByVendor,
  setMarketplaceCheckoutIdsCookie,
} from "@/features/checkout/cart";
import { deleteCheckoutIdCookie } from "@/features/checkout/checkout";
import { MARKETPLACE_NO_VENDOR_BUCKET } from "@/features/checkout/constants";
import { type MarketplaceCheckoutItem } from "@/features/checkout/types";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { getMarketplaceService } from "@/services/marketplace";
import { getServiceRegistry } from "@/services/registry";

export const getCheckoutOrRedirect = async (): Promise<Checkout> | never => {
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

const getVendorDisplayName = (
  checkout: Checkout,
  vendorKey: string,
): string => {
  const vendorFromLines = checkout.lines
    .map((line) => line.product.vendorId)
    .find((vendorId): vendorId is string => !!vendorId);

  if (vendorFromLines) {
    return vendorFromLines;
  }

  if (vendorKey === MARKETPLACE_NO_VENDOR_BUCKET) {
    return "Marketplace";
  }

  return vendorKey;
};

export const getMarketplaceCheckoutsOrRedirect = async ():
  | Promise<MarketplaceCheckoutItem[]>
  | never => {
  const [checkoutIdsByVendor, locale, region, services] = await Promise.all([
    getCheckoutIdsByVendor(),
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

      let displayName = "Marketplace";

      if (vendorKey !== MARKETPLACE_NO_VENDOR_BUCKET) {
        const marketplaceService = await services.getMarketplaceService();
        const vendorProfileResult =
          await marketplaceService.vendorGetByID(vendorKey);

        if (vendorProfileResult.ok) {
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
    await clearCheckoutCookie();
    redirect({ href: paths.cart.asPath(), locale });
  }

  const validCheckoutIds = new Set(
    validCheckoutItems.map((item) => item.checkoutId),
  );
  const filteredCheckoutIdsByVendor = Object.fromEntries(
    Object.entries(checkoutIdsByVendor).filter(([, checkoutId]) =>
      validCheckoutIds.has(checkoutId),
    ),
  );

  if (
    Object.keys(filteredCheckoutIdsByVendor).length !==
    Object.keys(checkoutIdsByVendor).length
  ) {
    await setMarketplaceCheckoutIdsCookie(filteredCheckoutIdsByVendor);
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
