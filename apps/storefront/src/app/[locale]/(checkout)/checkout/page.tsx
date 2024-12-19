import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { COOKIE_KEY } from "@/config";
import { redirect } from "@/i18n/routing";
import { deleteCheckoutIdCookie } from "@/lib/actions/checkout";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { checkoutService, userService } from "@/services";

export default async function Page() {
  const checkoutId = (await cookies()).get(COOKIE_KEY.checkoutId)?.value;
  const accessToken = await getAccessToken();
  const locale = await getLocale();

  const [region, user] = await Promise.all([
    getCurrentRegion(),
    userService.userGet(accessToken),
  ]);

  if (!checkoutId) {
    redirect({ href: paths.cart.asPath(), locale });
  }

  const { checkout } = await checkoutService.checkoutGet({
    checkoutId,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
  });

  if (!checkout) {
    await deleteCheckoutIdCookie();
    redirect({ href: paths.cart.asPath(), locale });
  }

  if (!checkout.email && !user?.email) {
    redirect({ href: paths.checkout.userDetails.asPath(), locale });
  }

  if (user?.email || !checkout.shippingAddress) {
    redirect({ href: paths.checkout.shippingAddress.asPath(), locale });
  }

  if (!checkout.deliveryMethod) {
    redirect({ href: paths.checkout.deliveryMethod.asPath(), locale });
  }

  redirect({ href: paths.checkout.payment.asPath(), locale });
}
