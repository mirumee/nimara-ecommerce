"use server";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type User } from "@nimara/domain/objects/User";

import { redirect } from "@/i18n/routing";
import { paths } from "@/lib/paths";

export const validateCheckoutStepAction = async ({
  checkout,
  user,
  locale,
  step,
}: {
  checkout: Checkout;
  locale: string;
  step:
    | "payment"
    | "delivery-method"
    | "shipping-address"
    | "user-details"
    | null;
  user: User | null;
}) => {
  if (!checkout.email && !user?.email) {
    if (step !== "user-details") {
      redirect({ href: paths.checkout.userDetails.asPath(), locale });
    }

    return;
  }

  if (user?.email || !checkout.shippingAddress) {
    if (step !== "shipping-address") {
      redirect({ href: paths.checkout.shippingAddress.asPath(), locale });
    }

    return;
  }

  if (!checkout.deliveryMethod) {
    if (step !== "delivery-method") {
      redirect({ href: paths.checkout.deliveryMethod.asPath(), locale });
    }

    return;
  }

  if (step !== "payment") {
    redirect({ href: paths.checkout.payment.asPath(), locale });
  }
};
