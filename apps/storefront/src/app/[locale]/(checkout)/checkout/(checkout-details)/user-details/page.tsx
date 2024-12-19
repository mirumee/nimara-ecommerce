import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { COOKIE_KEY } from "@/config";
import { redirect } from "@/i18n/routing";
import { deleteCheckoutIdCookie } from "@/lib/actions/checkout";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { checkoutService, userService } from "@/services";

import { CheckoutSkeleton } from "../../_components/checkout-skeleton";
import { DeliveryMethodSection } from "../../_sections/delivery-method-section";
import { PaymentSection } from "../../_sections/payment-section";
import { ShippingAddressSection } from "../../_sections/shipping-address-section";
import { UserDetailsForm } from "./form";

export default async function Page() {
  const checkoutId = (await cookies()).get(COOKIE_KEY.checkoutId)?.value;
  const locale = await getLocale();
  const region = await getCurrentRegion();

  if (!checkoutId) {
    redirect({ href: paths.cart.asPath(), locale });
  }

  const accessToken = await getAccessToken();

  const [{ checkout }, user] = await Promise.all([
    checkoutService.checkoutGet({
      checkoutId,
      languageCode: region.language.code,
      countryCode: region.market.countryCode,
    }),
    userService.userGet(accessToken),
  ]);

  if (user) {
    await checkoutService.checkoutCustomerAttach({
      accessToken: accessToken,
      id: checkoutId,
    });
  }

  if (!checkout) {
    await deleteCheckoutIdCookie();
    redirect({ href: paths.cart.asPath(), locale });
  }

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
