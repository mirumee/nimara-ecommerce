import { getTranslations } from "next-intl/server";

import BrandLogo from "@/assets/brand-logo-dark.svg";
import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

export const Logo = async () => {
  const t = await getTranslations("common");

  return (
    <LocalizedLink
      href={paths.home.asPath()}
      title={t("go-to-homepage")}
      aria-label={t("logo")}
    >
      <BrandLogo height={36} className="fill-primary" />
    </LocalizedLink>
  );
};

Logo.displayName = "Logo";
