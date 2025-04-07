"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { AuthError } from "next-auth";

import { getAccessToken, signIn } from "@/auth";
import { CACHE_TTL, COOKIE_KEY } from "@/config";
import { clientEnvs } from "@/envs/client";
import { setCheckoutIdCookie } from "@/lib/actions/cart";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import {
  cartService as saleorCartService,
  checkoutService,
  errorService,
  userService,
} from "@/services";
import { storefrontLogger } from "@/services/logging";

export async function login({
  email,
  password,
  redirectUrl,
}: {
  email: string;
  password: string;
  redirectUrl?: string;
}) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    const accessToken = await getAccessToken();
    const user = await userService.userGet(accessToken);
    const checkoutId = (await cookies()).get(COOKIE_KEY.checkoutId)?.value;

    if (user?.checkoutIds.length) {
      const userLatestCheckoutId = user.checkoutIds[0];

      await setCheckoutIdCookie(userLatestCheckoutId);

      if (checkoutId) {
        const region = await getCurrentRegion();
        const regionSettings = {
          countryCode: region.market.countryCode,
          languageCode: region.language.code,
        };
        const [{ checkout: guestCheckout }, { checkout: userCheckout }] =
          await Promise.all([
            checkoutService.checkoutGet({
              checkoutId,
              ...regionSettings,
            }),
            checkoutService.checkoutGet({
              checkoutId: userLatestCheckoutId,
              ...regionSettings,
            }),
          ]);

        if (userCheckout?.id) {
          const cartService = saleorCartService({
            ...regionSettings,
            channel: region.market.channel,
            apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
            logger: storefrontLogger,
          });

          const lineItemsFromGuestCheckout =
            guestCheckout?.lines.filter((line) =>
              userCheckout?.lines.some(
                (userLine) => userLine.variant.id !== line?.variant.id,
              ),
            ) ?? [];

          await cartService.linesAdd({
            cartId: userCheckout.id,
            lines: lineItemsFromGuestCheckout.map(({ quantity, variant }) => ({
              quantity,
              variantId: variant.id,
            })),
            options: {
              next: {
                revalidate: CACHE_TTL.cart,
                tags: [`CHECKOUT:${userCheckout.id}`],
              },
            },
          });
        }
      }
    } else if (checkoutId) {
      await checkoutService.checkoutCustomerAttach({
        accessToken,
        id: checkoutId,
      });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: true };
        default:
          errorService.logError(error);

          return { error: true };
      }
    }

    return { error: true };
  }

  revalidatePath(paths.home.asPath());

  return {
    redirectUrl:
      redirectUrl || paths.home.asPath({ query: { loggedIn: "true" } }),
  };
}
