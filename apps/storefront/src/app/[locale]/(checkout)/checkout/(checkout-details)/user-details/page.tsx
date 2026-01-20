import { getCheckoutOrRedirect } from "@/features/checkout/checkout-actions";
import type { SupportedLocale } from "@/foundation/regions/types";
import { getCheckoutService } from "@/services/checkout";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

import { DeliveryMethodSection } from "../../_sections/delivery-method-section";
import { PaymentSection } from "../../_sections/payment-section";
import { ShippingAddressSection } from "../../_sections/shipping-address-section";
import { UserDetailsForm } from "./user-details-form";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
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

  if (resultUserGet?.data) {
    const checkoutService = await getCheckoutService();

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
