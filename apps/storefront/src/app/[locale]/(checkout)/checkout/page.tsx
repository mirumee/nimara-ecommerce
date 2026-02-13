import { type Metadata } from "next";
import { type Locale } from "next-intl";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { redirect } from "@nimara/i18n/routing";

import { getCheckoutOrRedirect } from "@/features/checkout/checkout-actions";
import { Summary } from "@/features/checkout/checkout-summary/summary";
import { CheckoutWrapper } from "@/foundation/checkout/checkout-wrapper";
import { getCheckoutPaymentSectionData } from "@/foundation/checkout/sections/payment/helpers/get-checkout-payment-section-data";
import { CheckoutSections } from "@/foundation/checkout/sections/sections";
import { getCheckoutShippingAddressSectionData } from "@/foundation/checkout/sections/shipping-address/helpers/get-checkout-shipping-address-section-data";
import {
  CHECKOUT_STEPS_MAP,
  type CheckoutStep,
} from "@/foundation/checkout/steps";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

interface PageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    country?: AllCountryCode;
    errorCode?: AppErrorCode;
    step: CheckoutStep | null;
  }>;
}

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function Page(props: PageProps) {
  const [{ locale }, searchParams, checkout, accessToken, services] =
    await Promise.all([
      props.params,
      props.searchParams,
      getCheckoutOrRedirect(),
      getAccessToken(),
      getServiceRegistry(),
    ]);

  const currentStep = searchParams.step;

  if (!currentStep) {
    let step: CheckoutStep | null = null;

    const requiresEmail = checkout.email === null;
    const requiresShipping = checkout.isShippingRequired;
    const requiresShippingAddress = checkout.shippingAddress === null;
    const requiresDeliveryMethod = checkout.deliveryMethod === null;

    if (requiresEmail) {
      step = CHECKOUT_STEPS_MAP.USER_DETAILS;
    } else if (!requiresShipping) {
      step = CHECKOUT_STEPS_MAP.PAYMENT;
    } else if (requiresShippingAddress) {
      step = CHECKOUT_STEPS_MAP.SHIPPING_ADDRESS;
    } else if (requiresDeliveryMethod) {
      step = CHECKOUT_STEPS_MAP.DELIVERY_METHOD;
    } else {
      step = CHECKOUT_STEPS_MAP.PAYMENT;
    }

    redirect({
      href: paths.checkout.asPath({ query: { step } }),
      locale,
    });
  }

  const userService = await services.getUserService();
  const resultUserGet = await userService.userGet(accessToken);

  const user = resultUserGet.ok ? resultUserGet.data : null;
  const shippingAddressSectionData = checkout.isShippingRequired
    ? await getCheckoutShippingAddressSectionData({
        accessToken,
        checkout,
        country: searchParams.country,
        locale,
        user,
      })
    : null;
  const paymentSectionData =
    currentStep === CHECKOUT_STEPS_MAP.PAYMENT
      ? await getCheckoutPaymentSectionData({
          accessToken,
          checkout,
          country: searchParams.country,
          errorCode: searchParams.errorCode,
          locale,
          user,
        })
      : null;

  return (
    <CheckoutWrapper summary={<Summary checkout={checkout} />}>
      <CheckoutSections
        step={currentStep}
        checkout={checkout}
        paymentSectionData={paymentSectionData}
        shippingAddressSectionData={shippingAddressSectionData}
        user={user}
      />
    </CheckoutWrapper>
  );
}
