import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAccessToken } from "@/auth";
import { COOKIE_KEY } from "@/config";
import { deleteCheckoutIdCookie } from "@/lib/actions/checkout";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { checkoutService, userService } from "@/services";

import { CheckoutSkeleton } from "../../_components/checkout-skeleton";
import { EmailSection } from "../../_sections/email-section";
import { PaymentSection } from "../../_sections/payment-section";
import { ShippingAddressSection } from "../../_sections/shipping-address-section";
import { DeliveryMethodForm } from "./form";

export default async function Page() {
  const checkoutId = cookies().get(COOKIE_KEY.checkoutId)?.value;

  const accessToken = getAccessToken();

  const region = await getCurrentRegion();

  if (!checkoutId) {
    redirect(paths.cart.asPath());
  }

  const { checkout } = await checkoutService.checkoutGet({
    checkoutId,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
  });

  if (!checkout) {
    await deleteCheckoutIdCookie();
    redirect(paths.cart.asPath());
  }

  if (checkout.problems.insufficientStock.length) {
    return <CheckoutSkeleton />;
  }

  const user = await userService.userGet(accessToken);

  return (
    <>
      <EmailSection checkout={checkout} user={user} />
      <ShippingAddressSection checkout={checkout} />
      <DeliveryMethodForm checkout={checkout} />
      <PaymentSection />
    </>
  );
}
