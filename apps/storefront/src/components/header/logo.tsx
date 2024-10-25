"use client";

import { useTranslations } from "next-intl";

import { ReactComponent as NimaraLogo } from "@/assets/nimara-logo.svg";
import { Link } from "@/i18n/routing";
import { paths } from "@/lib/paths";

export const Logo = () => {
  const t = useTranslations("common");

  return (
    <h2
      className="flex justify-center align-middle md:justify-start"
      aria-label={t("logo")}
    >
      <Link href={paths.home.asPath()} title={t("go-to-homepage")}>
        <NimaraLogo height={36} />
      </Link>
    </h2>
  );
};

Logo.displayName = "Logo";
