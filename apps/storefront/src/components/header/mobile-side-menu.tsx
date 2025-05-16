"use client";

import { MenuIcon, ShoppingBagIcon, User as UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";

import type { Menu } from "@nimara/domain/objects/Menu";
import type { User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";
import { DialogTitle } from "@nimara/ui/components/dialog";
import { Sheet, SheetContent } from "@nimara/ui/components/sheet";

import { MobileNavigation } from "@/components/mobile-navigation";
import { Link, usePathname } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";
import { useCurrentRegion } from "@/regions/client";

import { LocaleSwitch } from "../locale-switch";
import { Logo } from "./logo";
import { MobileSearch } from "./mobile-search";
import { ShoppingBagIconWithCount } from "./shopping-bag-icon-with-count";

export const MobileSideMenu = ({
  checkoutLinesCount,
  menu,
  user,
}: {
  checkoutLinesCount: number;
  menu: Menu | null | undefined;
  user: User | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const pathname = usePathname();
  const t = useTranslations();
  const region = useCurrentRegion();

  const handleMenuItemClick = (isMenuItemClicked: boolean) => {
    setIsOpen(!isMenuItemClicked);
  };

  useEffect(() => setIsOpen(false), [pathname]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="gap-1"
        onClick={() => setIsOpen(true)}
        title="menu"
      >
        <MenuIcon />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-screen sm:w-1/2">
          <DialogTitle>
            <span className="sr-only">Menu</span>
          </DialogTitle>
          <div className="relative flex h-full flex-col justify-between gap-4 overflow-auto">
            <div className="flex h-full flex-col">
              <div
                className={cn(
                  "flex w-full items-center justify-between gap-4 pb-4 sm:hidden",
                  {
                    "mt-2": checkoutLinesCount,
                  },
                )}
              >
                <Logo />
                <div className="flex justify-end gap-1 align-middle">
                  <MobileSearch />
                  <Suspense fallback={<ShoppingBagIcon />}>
                    <ShoppingBagIconWithCount count={checkoutLinesCount} />
                  </Suspense>
                </div>
              </div>
              <MobileNavigation
                menu={menu}
                onMenuItemClick={handleMenuItemClick}
              />
              <div className="mt-auto flex w-full items-center justify-between bg-white">
                <LocaleSwitch region={region} />
                <Button asChild variant="ghost" className="inline-flex gap-1.5">
                  <Link
                    href={
                      !user
                        ? paths.signIn.asPath()
                        : paths.account.profile.asPath()
                    }
                  >
                    <UserIcon className="h-4 w-4" />
                    {user?.firstName ?? t("auth.sign-in")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
