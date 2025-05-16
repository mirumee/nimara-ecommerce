"use client";

import { useTranslations } from "next-intl";

import { Button } from "@nimara/ui/components/button";
import { cn } from "@nimara/ui/lib/utils";

import { Link, usePathname } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { type TranslationMessage } from "@/types";

import { logout } from "./actions";

export function SideLinks() {
  const t = useTranslations();

  const pathname = usePathname();

  const navLinks: {
    href: string;
    title: TranslationMessage;
  }[] = [
    { title: "account.order-history", href: paths.account.orders.asPath() },
    { title: "account.addresses", href: paths.account.addresses.asPath() },
    { title: "account.personal-data", href: paths.account.profile.asPath() },
    {
      title: "account.privacy-settings",
      href: paths.account.privacySettings.asPath(),
    },
    {
      title: "payment.payment-methods",
      href: paths.account.paymentMethods.asPath(),
    },
  ];

  return (
    <ul className="no-scrollbar flex gap-x-1 overflow-auto whitespace-nowrap py-3 md:flex-col md:gap-x-0 md:gap-y-0.5 md:whitespace-normal md:py-0">
      {navLinks.map((link) => (
        <li key={link.title}>
          <Button
            asChild
            variant="ghost"
            className={cn(
              pathname === link.href && "rounded-md bg-stone-100",
              "w-full justify-start px-4 py-2 text-sm font-medium md:px-2 md:py-1.5 md:font-normal",
            )}
          >
            <Link href={link.href}>{t(link.title)}</Link>
          </Button>
        </li>
      ))}
      <li>
        <Button
          onClick={async () => logout()}
          className="w-full justify-start px-4 py-2 text-sm font-medium md:my-4 md:px-2 md:py-1.5 md:font-normal"
          variant="ghost"
        >
          {t("auth.log-out")}
        </Button>
      </li>
    </ul>
  );
}
