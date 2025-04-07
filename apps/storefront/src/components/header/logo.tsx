"use client";

import { useTranslations } from "next-intl";

import BrandLogo from "@/assets/brand-logo-dark.svg";
import { Link } from "@/i18n/routing";
import { paths } from "@/lib/paths";

export const Logo = () => {
  const t = useTranslations("common");

  return (
    <h1
      className="flex justify-center align-middle md:justify-start"
      aria-label={t("logo")}
    >
      <Link href={paths.home.asPath()} title={t("go-to-homepage")}>
        <BrandLogo height={36} className="fill-primary" />
      </Link>
    </h1>
  );
};

Logo.displayName = "Logo";
