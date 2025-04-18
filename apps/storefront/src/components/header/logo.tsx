"use client";

import { useTranslations } from "next-intl";

import BrandLogo from "@/assets/brand-logo-dark.svg";
import { Link, usePathname } from "@/i18n/routing";
import { paths } from "@/lib/paths";

export const Logo = () => {
  const t = useTranslations("common");
  const pathname = usePathname();
  const asH1 =
    !pathname.includes("products") && !pathname.includes("collection");
  const Wrapper = asH1 ? "h1" : "span";

  return (
    <Wrapper className="flex justify-center md:justify-start">
      <Link href={paths.home.asPath()} title={t("go-to-homepage")}>
        <BrandLogo
          height={36}
          className="fill-primary"
          aria-label={t("logo")}
        />
      </Link>
    </Wrapper>
  );
};

Logo.displayName = "Logo";
