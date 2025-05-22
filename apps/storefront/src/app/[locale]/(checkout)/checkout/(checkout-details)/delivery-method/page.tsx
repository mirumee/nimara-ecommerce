import { getLocale } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { getCheckoutOrRedirect } from "@/lib/checkout";
import { userService } from "@/services/user";

import { CheckoutSkeleton } from "../../_components/checkout-skeleton";
import { EmailSection } from "../../_sections/email-section";
import { PaymentSection } from "../../_sections/payment-section";
import { ShippingAddressSection } from "../../_sections/shipping-address-section";
import { validateCheckoutStepAction } from "../../actions";
import { DeliveryMethodForm } from "./form";

export default async function Page() {
  const checkout = await getCheckoutOrRedirect();

  if (checkout.problems.insufficientStock.length) {
    return <CheckoutSkeleton />;
  }

  const accessToken = await getAccessToken();

  const [resultUserGet, locale] = await Promise.all([
    userService.userGet(accessToken),
    getLocale(),
  ]);

  const user = resultUserGet.ok ? resultUserGet.data : null;

  await validateCheckoutStepAction({
    checkout,
    user,
    locale,
    step: "delivery-method",
  });

  return (
    <>
      <EmailSection checkout={checkout} user={user} />
      <ShippingAddressSection checkout={checkout} />
      <DeliveryMethodForm checkout={checkout} />
      <PaymentSection />
    </>
  );
}
