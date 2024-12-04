import { User } from "lucide-react";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { Button } from "@nimara/ui/components/button";

import { getAccessToken } from "@/auth";
import { LocaleSwitch } from "@/components/locale-switch";
import { CACHE_TTL, COOKIE_KEY } from "@/config";
import { clientEnvs } from "@/envs/client";
import { Link } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { cartService, userService } from "@/services";
import { cmsMenuService } from "@/services/cms";

import { Logo } from "./logo";
import { MobileSearch } from "./mobile-search";
import { MobileSideMenu } from "./mobile-side-menu";
import { SearchForm } from "./search-form";
import { ShoppingBagIcon } from "./shopping-bag-icon";
import { ShoppingBagIconWithCount } from "./shopping-bag-icon-with-count";

export const Header = async () => {
  const accessToken = await getAccessToken();
  const [user, region, t] = await Promise.all([
    userService.userGet(accessToken),
    getCurrentRegion(),
    getTranslations(),
  ]);

  const menu = await cmsMenuService.menuGet({
    channel: region.market.channel,
    languageCode: region.language.code,
    slug: "navbar",
    options: {
      next: {
        tags: ["CMS:navbar"],
        revalidate: CACHE_TTL.cms,
      },
    },
  });

  let checkoutLinesCount = 0;
  const checkoutId = (await cookies()).get(COOKIE_KEY.checkoutId)?.value;

  if (checkoutId) {
    const cart = await cartService({
      apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
      languageCode: region.language.code,
      countryCode: region.market.countryCode,
      channel: region.market.channel,
    }).cartGet({ cartId: checkoutId });

    checkoutLinesCount = cart?.linesQuantityCount ?? 0;
  }

  return (
    <header>
      <div className="container">
        <div className="grid w-full grid-flow-col grid-cols-[repeat(3,1fr)] justify-between gap-4">
          <div className="md:hidden">
            <MobileSideMenu
              user={user}
              menu={menu?.menu}
              checkoutLinesCount={checkoutLinesCount}
            />
          </div>

          <Logo />

          <div className="hidden md:block">
            <SearchForm />
          </div>

          <div className="flex justify-end gap-1 align-middle">
            <MobileSearch />

            <div className="hidden md:block">
              <LocaleSwitch region={region} />
            </div>

            <Button
              asChild
              variant="ghost"
              className="hidden gap-1.5 md:inline-flex"
              aria-label={
                !user
                  ? t("auth.sign-in")
                  : t("account.profile-of", { user: user?.firstName })
              }
            >
              <Link
                href={
                  !user ? paths.signIn.asPath() : paths.account.profile.asPath()
                }
              >
                <User className="h-4 w-4" />
                {user?.firstName && user.firstName}
              </Link>
            </Button>

            <Suspense fallback={<ShoppingBagIcon />}>
              <ShoppingBagIconWithCount count={checkoutLinesCount} />
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  );
};
