"use client";

import { useTranslations } from "next-intl";

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
    <ul className="flex gap-x-1 overflow-auto whitespace-nowrap py-3 no-scrollbar md:flex-col md:gap-x-0 md:gap-y-0.5 md:whitespace-normal md:py-0">
      {navLinks.map((link) => (
        <li key={link.title}>
          <Link
            href={link.href}
            className={cn(
              pathname === link.href && "rounded-md bg-stone-100",
              "block border border-transparent px-4 py-2 text-sm font-medium hover:rounded-md hover:bg-stone-100 md:px-2 md:py-1.5 md:font-normal",
            )}
          >
            {t(link.title)}
          </Link>
        </li>
      ))}
      <li>
        <button
          className="flex w-full border border-transparent px-4 py-2 text-sm font-medium hover:rounded-md hover:bg-stone-100 md:my-4 md:px-2 md:py-1.5 md:font-normal"
          onClick={async () => logout()}
        >
          {t("auth.log-out")}
        </button>
      </li>
    </ul>
  );
}
