"use client";

import { useTranslations } from "next-intl";

import BrandLogo from "@/assets/brand-logo-dark.svg";
import { Link } from "@/i18n/routing";
import { paths } from "@/lib/paths";

export const Logo = ({ asH1 = true }: { asH1?: boolean }) => {
  const t = useTranslations("common");

  const logoContent = (
    <Link href={paths.home.asPath()} title={t("go-to-homepage")}>
      <BrandLogo height={36} className="fill-primary" aria-label={t("logo")} />
    </Link>
  );

  if (asH1) {
    return (
      <h1 className="flex justify-center align-middle md:justify-start">
        {logoContent}
      </h1>
    );
  }

  return (
    <span className="flex justify-center align-middle md:justify-start">
      {logoContent}
    </span>
  );
};

Logo.displayName = "Logo";
