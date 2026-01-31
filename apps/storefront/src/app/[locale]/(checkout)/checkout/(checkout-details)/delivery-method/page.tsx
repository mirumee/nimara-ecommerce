import { type Locale } from "next-intl";

import { getCheckoutOrRedirect } from "@/features/checkout/checkout-actions";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

import { EmailSection } from "../../_sections/email-section";
import { PaymentSection } from "../../_sections/payment-section";
import { ShippingAddressSection } from "../../_sections/shipping-address-section";
import { validateCheckoutStepAction } from "../../actions";
import { DeliveryMethodForm } from "./form";

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function Page(props: PageProps) {
  const [{ locale }, checkout, accessToken, services] = await Promise.all([
    props.params,
    getCheckoutOrRedirect(),
    getAccessToken(),
    getServiceRegistry(),
  ]);
  const userService = await services.getUserService();

  const resultUserGet = await userService.userGet(accessToken);

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
      <ShippingAddressSection checkout={checkout} locale={locale} />
      <DeliveryMethodForm checkout={checkout} />
      <PaymentSection />
    </>
  );
}
