import { getTranslations } from "next-intl/server";

import type { Checkout } from "@nimara/domain/objects/Checkout";
import type { User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";

import { Link } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { checkoutService } from "@/services/checkout";
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
          <p className="break-all text-sm text-stone-900">
            {userFullName} {user.email}
          </p>
        </section>
      ) : (
        <section className="flex justify-between">
          <div className="max-w-[70%] space-y-2">
            <h2 className="scroll-m-20 text-2xl tracking-tight">
              {t("user-details.title")}
            </h2>
            <p className="break-all text-sm font-normal leading-5 text-stone-900">
              {checkout.email}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={paths.checkout.userDetails.asPath()}>
              {t("common.edit")}
            </Link>
          </Button>
        </section>
      )}
    </>
  );
};
