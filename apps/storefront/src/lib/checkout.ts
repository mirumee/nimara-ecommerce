import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";

import { type Address } from "@nimara/domain/objects/Address";
import { type OkResult } from "@nimara/domain/objects/Result";

import { COOKIE_KEY } from "@/config";
import { redirect } from "@/i18n/routing";
import { deleteCheckoutIdCookie } from "@/lib/actions/checkout";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { type addressService } from "@/services/address";
import { checkoutService } from "@/services/checkout";

type GetCheckout = OkResult<
  Awaited<ReturnType<typeof checkoutService.checkoutGet>>
>["checkout"];

export const getCheckoutOrRedirect = async (): Promise<GetCheckout> => {
  const checkoutId = (await cookies()).get(COOKIE_KEY.checkoutId)?.value;
  const [locale, region] = await Promise.all([getLocale(), getCurrentRegion()]);

  if (!checkoutId) {
    redirect({ href: paths.cart.asPath(), locale });
  }

  const resultCheckout = await checkoutService.checkoutGet({
    checkoutId,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
  });

  if (!resultCheckout.ok) {
    await deleteCheckoutIdCookie();
    redirect({ href: paths.cart.asPath(), locale });
  }

  return resultCheckout.data.checkout;
};

export type FormattedAddress = OkResult<
  Awaited<ReturnType<typeof addressService.addressFormat>>
> & { address: Address };
