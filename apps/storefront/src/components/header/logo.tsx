"use client";

import { useTranslations } from "next-intl";

import NimaraLogo from "@/assets/nimara-logo.svg";
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
        <NimaraLogo height={36} />
      </Link>
    </h1>
  );
};

Logo.displayName = "Logo";
