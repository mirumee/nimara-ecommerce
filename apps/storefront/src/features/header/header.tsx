import { User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { LocalizedLink } from "@nimara/i18n/routing";
import { Button } from "@nimara/ui/components/button";

import { CACHE_TTL } from "@/config";
import { getCheckoutId } from "@/features/checkout/cart";
import { LocaleSwitch } from "@/features/header/locale-switch";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

import { Logo } from "./logo";
import { MobileSearch } from "./mobile-search";
import { MobileSideMenu } from "./mobile-side-menu";
import { SearchForm } from "./search-form";
import { ShoppingBagIcon } from "./shopping-bag-icon";
import { ShoppingBagIconWithCount } from "./shopping-bag-icon-with-count";
import { ThemeToggle } from "./theme-toggle";

export const Header = async () => {
  const [accessToken, services, region, t] = await Promise.all([
    getAccessToken(),
    getServiceRegistry(),
    getCurrentRegion(),
    getTranslations(),
  ]);

  const cmsMenuService = await services.getCMSMenuService();
  const resultMenu = await cmsMenuService.menuGet({
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

  const userService = await services.getUserService();
  const resultUserGet = await userService.userGet(accessToken);
  const user = resultUserGet.ok ? resultUserGet.data : null;

  let checkoutLinesCount = 0;
  const checkoutId = await getCheckoutId();

  if (checkoutId) {
    const cartService = await services.getCartService();
    const resultCartGet = await cartService.cartGet({
      cartId: checkoutId,
      languageCode: region.language.code,
      countryCode: region.market.countryCode,
      options: {
        next: {
          tags: [`CHECKOUT:${checkoutId}`],
          revalidate: CACHE_TTL.cart,
        },
      },
    });

    checkoutLinesCount = resultCartGet.data?.linesQuantityCount ?? 0;
  }

  const shoppingBag = <ShoppingBagIconWithCount count={checkoutLinesCount} />;

  return (
    <header>
      <div className="container">
        <div className="grid w-full grid-flow-col grid-cols-[repeat(3,1fr)] justify-between gap-4">
          <div className="md:hidden">
            <MobileSideMenu
              user={user}
              menu={resultMenu?.data?.menu}
              checkoutLinesCount={checkoutLinesCount}
            >
              {shoppingBag}
            </MobileSideMenu>
          </div>

          <div className="flex items-center justify-center md:justify-start">
            <Logo />
          </div>
          <div className="hidden md:block">
            <SearchForm />
          </div>

          <div className="flex justify-end gap-1 align-middle">
            <MobileSearch />

            <div className="hidden md:block">
              <LocaleSwitch region={region} />
            </div>

            <div className="hidden md:block">
              <ThemeToggle />
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
              <LocalizedLink
                href={
                  !user ? paths.signIn.asPath() : paths.account.profile.asPath()
                }
              >
                <User className="h-4 w-4" />
                {user?.firstName && user.firstName}
              </LocalizedLink>
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
