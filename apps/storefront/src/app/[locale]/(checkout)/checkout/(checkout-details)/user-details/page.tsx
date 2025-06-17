import { getAccessToken } from "@/auth";
import { getCheckoutOrRedirect } from "@/lib/checkout";
import { type SupportedLocale } from "@/regions/types";
import { checkoutService } from "@/services/checkout";
import { userService } from "@/services/user";

import { DeliveryMethodSection } from "../../_sections/delivery-method-section";
import { PaymentSection } from "../../_sections/payment-section";
import { ShippingAddressSection } from "../../_sections/shipping-address-section";
import { UserDetailsForm } from "./user-details-form";

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

  if (resultUserGet?.data) {
    await checkoutService.checkoutCustomerAttach({
      accessToken,
      id: checkout.id,
    });
  }

  return (
    <>
      <UserDetailsForm checkout={checkout} />
      <ShippingAddressSection checkout={checkout} locale={locale} />
      <DeliveryMethodSection checkout={checkout} />
      <PaymentSection />
    </>
  );
}
