import { getLocale } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { getCheckoutOrRedirect } from "@/lib/checkout";
import { userService } from "@/services";

import { CheckoutSkeleton } from "./_components/checkout-skeleton";
import { validateCheckoutStepAction } from "./actions";

export default async function Page() {
  const checkout = await getCheckoutOrRedirect();

  if (checkout?.problems.insufficientStock.length) {
    return <CheckoutSkeleton />;
  }

  const accessToken = await getAccessToken();

  const [user, locale] = await Promise.all([
    userService.userGet(accessToken),
    getLocale(),
  ]);

  await validateCheckoutStepAction({ user, locale, checkout, step: null });
}
