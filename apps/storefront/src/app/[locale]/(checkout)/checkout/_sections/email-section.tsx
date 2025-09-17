import { getTranslations } from "next-intl/server";

import type { Checkout } from "@nimara/domain/objects/Checkout";
import type { User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";
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
    const result = await checkoutService.checkoutEmailUpdate({
      checkout,
      email: user.email,
    });

    if (!result.ok) {
      storefrontLogger.error("Failed to update email", result);
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
          <p className="text-foreground break-all text-sm">
            {userFullName} {user.email}
          </p>
        </section>
      ) : (
        <section className="flex justify-between">
          <div className="max-w-[70%] space-y-2">
            <h2 className="scroll-m-20 text-2xl tracking-tight">
              {t("user-details.title")}
            </h2>
            <p className="text-foreground break-all text-sm font-normal leading-5">
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
