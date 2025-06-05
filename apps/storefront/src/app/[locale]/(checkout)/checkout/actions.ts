"use server";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type User } from "@nimara/domain/objects/User";

import { redirect } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { type SupportedLocale } from "@/regions/types";

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
  // Step 1: Make sure we have an email
  // If missing, redirect to user details step
  if (!checkout.email && !user?.email) {
    if (step !== "user-details") {
      redirect({ href: paths.checkout.userDetails.asPath(), locale });
    }

    return;
  }

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

  // Final Step: if user is on any other step than payment, redirect to it
  if (step !== "payment") {
    redirect({ href: paths.checkout.payment.asPath(), locale });
  }
};
