import { getAccessToken } from "@/auth";
import { serverEnvs } from "@/envs/server";
import { getMarketplaceCheckoutIds } from "@/lib/actions/cart";
import { getCheckoutOrRedirect } from "@/lib/checkout";
import { type SupportedLocale } from "@/regions/types";
import { getCheckoutService } from "@/services/checkout";
import { getUserService } from "@/services/user";

import { DeliveryMethodSection } from "../../_sections/delivery-method-section";
import { PaymentSection } from "../../_sections/payment-section";
import { ShippingAddressSection } from "../../_sections/shipping-address-section";
import { UserDetailsForm } from "./user-details-form";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
};

export default async function Page(props: PageProps) {
  const [{ locale }, checkout, accessToken, userService] = await Promise.all([
    props.params,
    getCheckoutOrRedirect(),
    getAccessToken(),
    getUserService(),
  ]);

  const resultUserGet = await userService.userGet(accessToken);

  if (resultUserGet?.data) {
    const checkoutService = await getCheckoutService();
    const checkoutIds = serverEnvs.MARKETPLACE_MODE
      ? await getMarketplaceCheckoutIds()
      : [checkout.id];

    await Promise.allSettled(
      checkoutIds.map((checkoutId) =>
        checkoutService.checkoutCustomerAttach({
          accessToken,
          id: checkoutId,
        }),
      ),
    );
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
