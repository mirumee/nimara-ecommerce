import { type Metadata } from "next";
import { type Locale } from "next-intl";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { redirect } from "@nimara/i18n/routing";

import {
  MARKETPLACE_DEFAULT_VENDOR_DISPLAY_NAME,
  MARKETPLACE_NO_VENDOR_BUCKET,
} from "@/config";
import { clientEnvs } from "@/envs/client";
import {
  getCheckoutOrRedirect,
  getMarketplaceCheckoutsOrRedirect,
  getMarketplaceCheckoutSummary,
} from "@/features/checkout/checkout-actions";
import { Summary } from "@/features/checkout/summary";
import {
  CHECKOUT_STEPS_MAP,
  CheckoutSections,
  CheckoutWrapper,
  getCheckoutShippingAddressSectionData,
  getFirstIncompleteCheckoutStep,
  isCheckoutStepReachable,
  resolveCheckoutStep,
} from "@/foundation/checkout";
import * as foundationActions from "@/foundation/checkout";
import { getCheckoutPaymentSectionData } from "@/foundation/checkout/sections/payment/server";
import { paths, QUERY_PARAMS } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

interface PageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    country?: AllCountryCode;
    errorCode?: AppErrorCode;
    step?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function Page(props: PageProps) {
  const isMarketplaceEnabled = clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED;

  const [{ locale }, searchParams, checkoutData, accessToken, services] =
    await Promise.all([
      props.params,
      props.searchParams,
      isMarketplaceEnabled
        ? getMarketplaceCheckoutsOrRedirect()
        : getCheckoutOrRedirect(),
      getAccessToken(),
      getServiceRegistry(),
    ]);

  const marketplaceCheckouts = Array.isArray(checkoutData)
    ? checkoutData
    : null;
  const checkout = Array.isArray(checkoutData)
    ? getMarketplaceCheckoutSummary(checkoutData)
    : checkoutData;
  const primaryCheckout =
    marketplaceCheckouts?.find((item) => item.checkout.isShippingRequired)
      ?.checkout ??
    marketplaceCheckouts?.[0].checkout ??
    checkout;

  const currentStep = resolveCheckoutStep(searchParams.step);

  if (
    !currentStep ||
    !isCheckoutStepReachable({ checkout, step: currentStep })
  ) {
    redirect({
      href: paths.checkout.asPath({
        query: {
          [QUERY_PARAMS.step]: getFirstIncompleteCheckoutStep(checkout),
        },
      }),
      locale,
    });
  }

  const userService = await services.getUserService();
  const resultUserGet = await userService.userGet(accessToken);
  const user = resultUserGet.ok ? resultUserGet.data : null;

  const shippingAddressSectionData = checkout.isShippingRequired
    ? await getCheckoutShippingAddressSectionData({
        accessToken,
        checkout: primaryCheckout,
        country: searchParams.country,
        locale,
        user,
      })
    : null;
  const paymentSectionData =
    currentStep === CHECKOUT_STEPS_MAP.PAYMENT
      ? await getCheckoutPaymentSectionData({
          accessToken,
          checkout: primaryCheckout,
          country: searchParams.country,
          errorCode: searchParams.errorCode,
          locale,
          user,
        })
      : null;

  const vendorIdNames: Record<string, string> = {
    // Default vendor name for marketplace checkouts
    [MARKETPLACE_NO_VENDOR_BUCKET]: MARKETPLACE_DEFAULT_VENDOR_DISPLAY_NAME,
  };

  if (isMarketplaceEnabled) {
    const marketplaceService = await services.getMarketplaceService();
    const vendorIds = [
      ...new Set(checkout.lines.map((line) => line.product.vendorId)),
    ].filter(Boolean);

    await Promise.all(
      vendorIds.map(async (vendorId) => {
        const result = await marketplaceService.vendorGetByID(vendorId);

        if (result.ok && result.data) {
          vendorIdNames[vendorId] = result.data.name;
        }
      }),
    );
  }

  return (
    <CheckoutWrapper
      summary={
        <Summary
          checkout={checkout}
          vendorIdNames={vendorIdNames}
          addPromoCodeAction={foundationActions.addPromoCodeAction}
          removePromoCodeAction={foundationActions.removePromoCodeAction}
          hidePromoCode={isMarketplaceEnabled}
          mode={isMarketplaceEnabled ? "marketplace" : "standard"}
        />
      }
    >
      <CheckoutSections
        step={currentStep}
        checkout={primaryCheckout}
        marketplaceCheckouts={marketplaceCheckouts ?? undefined}
        paymentSectionData={paymentSectionData}
        shippingAddressSectionData={shippingAddressSectionData}
        user={user}
      />
    </CheckoutWrapper>
  );
}
