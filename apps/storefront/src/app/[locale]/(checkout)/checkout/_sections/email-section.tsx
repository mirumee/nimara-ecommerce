import { getTranslations } from "next-intl/server";

import type { Checkout } from "@nimara/domain/objects/Checkout";
import type { User } from "@nimara/domain/objects/User";
import { loggingService } from "@nimara/infrastructure/logging/service";
import { Button } from "@nimara/ui/components/button";

import { Link } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { checkoutService } from "@/services";

export const EmailSection = async ({
  checkout,
  user,
}: {
  checkout: Checkout;
  user: User | null;
}) => {
  const [t, tc] = await Promise.all([
    getTranslations("user-details"),
    getTranslations("common"),
  ]);

  if (!checkout?.email && user) {
    const { isSuccess, validationErrors, serverError } =
      await checkoutService.checkoutEmailUpdate({
        checkout,
        email: user.email,
      });

    if (!isSuccess) {
      loggingService.error(
        "Failed to update email",
        validationErrors || serverError,
      );
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
            {t("signed-in-as")}
          </h2>
          <p className="break-all text-sm text-stone-900">
            {userFullName} {user.email}
          </p>
        </section>
      ) : (
        <section className="flex justify-between">
          <div className="max-w-[70%] space-y-2">
            <h2 className="scroll-m-20 text-2xl tracking-tight">
              {t("title")}
            </h2>
            <p className="break-all text-sm font-normal leading-5 text-stone-900">
              {checkout.email}
            </p>
          </div>
          <Link href={paths.checkout.userDetails.asPath()}>
            <Button variant="outline">{tc("edit")}</Button>
          </Link>
        </section>
      )}
    </>
  );
};
