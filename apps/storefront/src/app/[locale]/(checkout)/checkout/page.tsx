import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAccessToken } from "@/auth";
import { COOKIE_KEY } from "@/config";
import { deleteCheckoutIdCookie } from "@/lib/actions/checkout";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { checkoutService, userService } from "@/services";

export default async function Page() {
  const checkoutId = cookies().get(COOKIE_KEY.checkoutId)?.value;
  const accessToken = getAccessToken();

  const [region, user] = await Promise.all([
    getCurrentRegion(),
    userService.userGet(accessToken),
  ]);

  if (!checkoutId) {
    redirect(paths.cart.asPath());
  }

  const { checkout } = await checkoutService.checkoutGet({
    checkoutId,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
  });

  // TODO handle different cases
  // if checkout is empty? what than? how to check it?
  // checkout?.order?.status === "complete"; // how to check it
  // in case of gone or its an order? different redirect in this cases?

  if (!checkout) {
    await deleteCheckoutIdCookie();
    redirect(paths.cart.asPath());
  }

  if (!checkout.email && !user?.email) {
    redirect(paths.checkout.userDetails.asPath());
  }

  if (user?.email || !checkout.shippingAddress) {
    redirect(paths.checkout.shippingAddress.asPath());
  }

  if (!checkout.deliveryMethod) {
    redirect(paths.checkout.deliveryMethod.asPath());
  }

  redirect(paths.checkout.payment.asPath());
}
