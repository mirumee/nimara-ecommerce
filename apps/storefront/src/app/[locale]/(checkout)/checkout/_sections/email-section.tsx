import { getTranslations } from "next-intl/server";

import type { Checkout } from "@nimara/domain/objects/Checkout";
import type { User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";

import { serverEnvs } from "@/envs/server";
import { LocalizedLink } from "@/i18n/routing";
import { getMarketplaceCheckoutIds } from "@/lib/actions/cart";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { getCheckoutService } from "@/services/checkout";
import { storefrontLogger } from "@/services/logging";

export const EmailSection = async ({
  checkout,
  user,
}: {
  checkout: Checkout;
  user: User | null;
}) => {
  const t = await getTranslations();

  if (!checkout?.email && user) {
    const checkoutService = await getCheckoutService();
    const checkoutIds = serverEnvs.MARKETPLACE_MODE
      ? await getMarketplaceCheckoutIds()
      : [checkout.id];

    const region = serverEnvs.MARKETPLACE_MODE
      ? await getCurrentRegion()
      : null;

    const settled = await Promise.allSettled(
      checkoutIds.map(async (checkoutId) => {
        const nextCheckout = serverEnvs.MARKETPLACE_MODE
          ? await checkoutService.checkoutGet({
              checkoutId,
              languageCode: region!.language.code,
              countryCode: region!.market.countryCode,
            })
          : { ok: true, data: { checkout } };

        if (!nextCheckout.ok) {
          return nextCheckout;
        }

        return checkoutService.checkoutEmailUpdate({
          checkout: nextCheckout.data.checkout,
          email: user.email,
        });
      }),
    );

    const hasFailedResult = settled.some((result) => {
      if (result.status === "rejected") {
        return true;
      }

      return !result.value.ok;
    });

    if (hasFailedResult) {
      storefrontLogger.error("Failed to update email", { checkoutIds });
    }
  }

  const userFullName = user?.firstName
    ? `${user?.firstName} ${user?.lastName},`
    : null;

  return (
    <>
      {!!user ? (
        <section className="flex flex-wrap gap-2">
          <h2 className="w-full scroll-m-20 text-2xl tracking-tight">
            {t("user-details.signed-in-as")}
          </h2>
          <p className="break-all text-sm text-foreground">
            {userFullName} {user.email}
          </p>
        </section>
      ) : (
        <section className="flex justify-between">
          <div className="max-w-[70%] space-y-2">
            <h2 className="scroll-m-20 text-2xl tracking-tight">
              {t("user-details.title")}
            </h2>
            <p className="break-all text-sm font-normal leading-5 text-foreground">
              {checkout.email}
            </p>
          </div>
          <Button variant="outline" asChild>
            <LocalizedLink href={paths.checkout.userDetails.asPath()}>
              {t("common.edit")}
            </LocalizedLink>
          </Button>
        </section>
      )}
    </>
  );
};
