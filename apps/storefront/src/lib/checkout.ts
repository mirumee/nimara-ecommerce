import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";

import { type Address } from "@nimara/domain/objects/Address";

import { COOKIE_KEY } from "@/config";
import { redirect } from "@/i18n/routing";
import { deleteCheckoutIdCookie } from "@/lib/actions/checkout";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { type addressService, checkoutService } from "@/services";

type GetCheckout = Awaited<ReturnType<typeof checkoutService.checkoutGet>>;

export const getCheckoutOrRedirect = async (): Promise<
  NonNullable<GetCheckout["checkout"]>
> => {
  const checkoutId = (await cookies()).get(COOKIE_KEY.checkoutId)?.value;
  const locale = await getLocale();
  const region = await getCurrentRegion();

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

  return checkout;
};

export type FormattedAddress = Awaited<
  ReturnType<typeof addressService.addressFormat>
> & { address: Address };
