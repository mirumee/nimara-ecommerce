import { getLocale } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { redirect } from "@/i18n/routing";
import { getCheckoutId } from "@/lib/actions/cart";
import { deleteCheckoutIdCookie } from "@/lib/actions/checkout";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { checkoutService, userService } from "@/services";
import { storefrontLogger } from "@/services/logging";

import { CheckoutSkeleton } from "../../_components/checkout-skeleton";
import { DeliveryMethodSection } from "../../_sections/delivery-method-section";
import { PaymentSection } from "../../_sections/payment-section";
import { ShippingAddressSection } from "../../_sections/shipping-address-section";
import { UserDetailsForm } from "./form";

export default async function Page() {
  const [checkoutId, locale, region] = await Promise.all([
    getCheckoutId(),
    getLocale(),
    getCurrentRegion(),
  ]);

  if (!checkoutId) {
    storefrontLogger.debug("No checkoutId cookie. Redirecting to cart.");

    redirect({ href: paths.cart.asPath(), locale });
  }

  const accessToken = await getAccessToken();

  const [resultCheckout, resultUserGet] = await Promise.all([
    checkoutService.checkoutGet({
      checkoutId,
      languageCode: region.language.code,
      countryCode: region.market.countryCode,
    }),
    userService.userGet(accessToken),
  ]);

  if (resultUserGet?.data) {
    await checkoutService.checkoutCustomerAttach({
      accessToken: accessToken,
      id: checkoutId,
    });
  }

  if (!resultCheckout.ok) {
    await deleteCheckoutIdCookie();
    redirect({ href: paths.cart.asPath(), locale });
  }

  const { checkout } = resultCheckout.data;

  if (checkout.problems.insufficientStock.length) {
    return <CheckoutSkeleton />;
  }

  return (
    <>
      <UserDetailsForm checkout={checkout} />
      <ShippingAddressSection checkout={checkout} />
      <DeliveryMethodSection checkout={checkout} />
      <PaymentSection />
    </>
  );
}
