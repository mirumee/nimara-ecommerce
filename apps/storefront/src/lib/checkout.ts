import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { type Address } from "@nimara/domain/objects/Address";

import { COOKIE_KEY } from "@/config";
import { deleteCheckoutIdCookie } from "@/lib/actions/checkout";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { type addressService, checkoutService } from "@/services";

type GetCheckout = Awaited<ReturnType<typeof checkoutService.checkoutGet>>;

export const getCheckoutOrRedirect = async (): Promise<
  NonNullable<GetCheckout["checkout"]>
> => {
  const checkoutId = cookies().get(COOKIE_KEY.checkoutId)?.value;

  const region = await getCurrentRegion();

  if (!checkoutId) {
    redirect(paths.cart.asPath());
  }

  const { checkout } = await checkoutService.checkoutGet({
    checkoutId,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
  });

  if (!checkout) {
    await deleteCheckoutIdCookie();
    redirect(paths.cart.asPath());
  }

  return checkout;
};

export type FormattedAddress = Awaited<
  ReturnType<typeof addressService.addressFormat>
> & { address: Address };
