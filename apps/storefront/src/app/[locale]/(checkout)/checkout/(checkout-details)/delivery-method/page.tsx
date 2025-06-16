import { getAccessToken } from "@/auth";
import { getCheckoutOrRedirect } from "@/lib/checkout";
import { type SupportedLocale } from "@/regions/types";
import { userService } from "@/services/user";

import { EmailSection } from "../../_sections/email-section";
import { PaymentSection } from "../../_sections/payment-section";
import { ShippingAddressSection } from "../../_sections/shipping-address-section";
import { validateCheckoutStepAction } from "../../actions";
import { DeliveryMethodForm } from "./form";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
};

export default async function Page(props: PageProps) {
  const [{ locale }, checkout, accessToken] = await Promise.all([
    props.params,
    getCheckoutOrRedirect(),
    getAccessToken(),
  ]);

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
