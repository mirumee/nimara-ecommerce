import { getAccessToken } from "@/auth";
import { serverEnvs } from "@/envs/server";
import { getCheckoutCollectionOrRedirect } from "@/lib/checkout";
import { type SupportedLocale } from "@/regions/types";
import { getUserService } from "@/services/user";

import { EmailSection } from "../../_sections/email-section";
import { PaymentSection } from "../../_sections/payment-section";
import { ShippingAddressSection } from "../../_sections/shipping-address-section";
import { validateCheckoutStepAction } from "../../actions";
import { DeliveryMethodForm } from "./form";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
};

export default async function Page(props: PageProps) {
  const [{ locale }, checkoutCollection, accessToken, userService] =
    await Promise.all([
      props.params,
      getCheckoutCollectionOrRedirect(),
      getAccessToken(),
      getUserService(),
    ]);
  const { checkout, checkouts } = checkoutCollection;

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
      <DeliveryMethodForm
        checkout={checkout}
        marketplaceCheckouts={
          serverEnvs.MARKETPLACE_MODE
            ? checkouts.filter(({ isShippingRequired }) => isShippingRequired)
            : undefined
        }
      />
      <PaymentSection />
    </>
  );
}
