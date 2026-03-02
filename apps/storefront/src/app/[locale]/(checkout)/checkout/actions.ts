"use server";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type User } from "@nimara/domain/objects/User";

import { serverEnvs } from "@/envs/server";
import { redirect } from "@/i18n/routing";
import { getMarketplaceCheckoutIds } from "@/lib/actions/cart";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { type SupportedLocale } from "@/regions/types";
import { getCheckoutService } from "@/services/checkout";

export const validateCheckoutStepAction = async ({
  checkout,
  user,
  locale,
  step,
}: {
  checkout: Checkout;
  locale: SupportedLocale;
  step:
    | "payment"
    | "delivery-method"
    | "shipping-address"
    | "user-details"
    | null;
  user: User | null;
}) => {
  if (serverEnvs.MARKETPLACE_MODE) {
    const checkoutIds = await getMarketplaceCheckoutIds();

    if (!checkoutIds.length) {
      redirect({ href: paths.cart.asPath(), locale });
    }

    const [region, checkoutService] = await Promise.all([
      getCurrentRegion(),
      getCheckoutService(),
    ]);

    const settled = await Promise.allSettled(
      checkoutIds.map((checkoutId) =>
        checkoutService.checkoutGet({
          checkoutId,
          languageCode: region.language.code,
          countryCode: region.market.countryCode,
        }),
      ),
    );

    const checkouts = settled
      .filter(
        (
          entry,
        ): entry is PromiseFulfilledResult<
          Awaited<ReturnType<typeof checkoutService.checkoutGet>>
        > => entry.status === "fulfilled",
      )
      .map(({ value }) => value)
      .filter((result) => result.ok)
      .map((result) => result.data.checkout);

    if (!checkouts.length) {
      redirect({ href: paths.cart.asPath(), locale });
    }

    const currencies = new Set(
      checkouts.map(
        (singleCheckout) => singleCheckout.totalPrice.gross.currency,
      ),
    );

    if (currencies.size > 1) {
      redirect({ href: paths.cart.asPath(), locale });
    }

    if (
      checkouts.some((singleCheckout) => !singleCheckout.email && !user?.email)
    ) {
      if (step !== "user-details") {
        redirect({ href: paths.checkout.userDetails.asPath(), locale });
      }

      return;
    }

    const shippingRequiredCheckouts = checkouts.filter(
      ({ isShippingRequired }) => isShippingRequired,
    );

    if (
      !shippingRequiredCheckouts.length &&
      (step === "shipping-address" || step === "delivery-method")
    ) {
      redirect({ href: paths.checkout.asPath(), locale });
    }

    if (shippingRequiredCheckouts.length) {
      if (
        shippingRequiredCheckouts.some(
          (singleCheckout) => !singleCheckout.shippingAddress,
        )
      ) {
        if (step !== "shipping-address") {
          redirect({ href: paths.checkout.shippingAddress.asPath(), locale });
        }

        return;
      }

      if (step === "shipping-address") {
        return;
      }

      if (
        shippingRequiredCheckouts.some(
          (singleCheckout) => !singleCheckout.deliveryMethod,
        )
      ) {
        if (step !== "delivery-method") {
          redirect({ href: paths.checkout.deliveryMethod.asPath(), locale });
        }

        return;
      }

      if (step === "delivery-method") {
        return;
      }
    }

    if (step !== "payment") {
      redirect({ href: paths.checkout.payment.asPath(), locale });
    }

    return;
  }

  // Step 1: Make sure we have an email
  // If missing, redirect to user details step
  if (!checkout.email && !user?.email) {
    if (step !== "user-details") {
      redirect({ href: paths.checkout.userDetails.asPath(), locale });
    }

    return;
  }

  // Prevent users from accessing shipping/delivery steps when not needed
  if (
    !checkout.isShippingRequired &&
    (step === "shipping-address" || step === "delivery-method")
  ) {
    redirect({ href: paths.checkout.asPath(), locale });
  }

  // Only enforce shipping steps if shipping is required
  if (checkout.isShippingRequired) {
    // Step 2: Make sure we have a shipping address
    // If missing, redirect to shipping address step
    if (!checkout.shippingAddress) {
      if (step !== "shipping-address") {
        redirect({ href: paths.checkout.shippingAddress.asPath(), locale });
      }

      return;
    }

    // Allow user to stay on shipping-address step (e.g. to edit it)
    if (step === "shipping-address") {
      return;
    }

    // Step 3: Make sure delivery method is selected
    // If missing, redirect to delivery-method step
    if (!checkout.deliveryMethod) {
      if (step !== "delivery-method") {
        redirect({ href: paths.checkout.deliveryMethod.asPath(), locale });
      }

      return;
    }

    // Allow user to stay on delivery-method step
    if (step === "delivery-method") {
      return;
    }
  }

  // Final Step: if user is on any other step than payment, redirect to it
  if (step !== "payment") {
    redirect({ href: paths.checkout.payment.asPath(), locale });
  }
};
